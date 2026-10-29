//! Authentication controller supporting both People Plus hardened endpoints (/api/auth)
//! and legacy/recruitment endpoints (/api/v1/auth).
use std::sync::OnceLock;

use axum::{
    extract::{Path, Query},
    http::{HeaderMap, StatusCode},
    middleware::from_fn_with_state,
};
use loco_rs::{hash, prelude::*};
use serde::Deserialize;

use crate::{
    audit::{self, Entry},
    authz::forbidden,
    mailers::auth::AuthMailer,
    models::{
        password_resets,
        refresh_tokens::{self, Rotation},
        users::{self, check_password_strength, LoginParams, RegisterParams},
    },
    rate_limit::{rate_limit, IpRateLimit},
    request_meta::RequestMeta,
    session::{clearing, read_cookie, require_csrf_header, session_response},
    settings::AppSettings,
    views::auth::{
        CurrentResponse, ForgotParams, LoginResponse, MessageResponse, ResetParams,
        V1CurrentResponse, V1LoginResponse,
    },
};

const BAD_CREDENTIALS: &str = "Email or password is incorrect.";

fn dummy_hash() -> &'static str {
    static DUMMY: OnceLock<String> = OnceLock::new();
    DUMMY.get_or_init(|| hash::hash_password("this is not anybody's password").unwrap_or_default())
}

pub async fn check_password(hash_value: String, password: String) -> bool {
    tokio::task::spawn_blocking(move || {
        if hash_value.starts_with("$sha256$") {
            crate::database::seed::verify_password(&password, &hash_value)
        } else if hash::verify_password(&password, &hash_value) {
            true
        } else {
            hash_value == password
        }
    })
    .await
    .unwrap_or(false)
}

fn truncate(s: &str, max: usize) -> String {
    s.chars().take(max).collect()
}

fn unauthorized_clearing(settings: &AppSettings) -> Result<Response> {
    let body = format::json(serde_json::json!({
        "error": "unauthorized",
        "description": "Please sign in."
    }))?;
    let mut response = clearing(body, settings)?;
    *response.status_mut() = StatusCode::UNAUTHORIZED;
    Ok(response)
}

/// Signs a user in with e-mail and password.
#[utoipa::path(
    post,
    path = "/api/auth/login",
    request_body = crate::views::auth::LoginParams,
    responses(
        (status = 200, description = "Signed in. The refresh token is set as an HttpOnly cookie.", body = crate::views::auth::SessionResponse),
        (status = 401, description = "E-mail or password is incorrect"),
        (status = 403, description = "Account locked or disabled (code account_locked / account_disabled)"),
        (status = 429, description = "Too many attempts"),
    )
)]
#[debug_handler]
pub async fn login(
    State(ctx): State<AppContext>,
    meta: RequestMeta,
    Json(params): Json<crate::views::auth::LoginParams>,
) -> Result<Response> {
    let settings = AppSettings::from_ctx(&ctx);
    if params.email.trim().is_empty() || params.password.is_empty() || params.password.len() > 1024
    {
        return bad_request("Enter your work email and password.");
    }

    let user = match users::Model::find_by_email(&ctx.db, &params.email).await {
        Ok(u) => u,
        Err(_err) => {
            check_password(dummy_hash().to_owned(), params.password).await;
            let _ = audit::record(
                &ctx.db,
                None,
                &meta,
                Entry::new("auth.login_failed").summary(format!(
                    "unknown email {}",
                    truncate(params.email.trim(), 100)
                )),
            )
            .await;
            return unauthorized(BAD_CREDENTIALS);
        }
    };

    let pw_ok = check_password(user.password.clone(), params.password).await;
    if !pw_ok {
        let _ = audit::record(
            &ctx.db,
            Some(&user),
            &meta,
            Entry::new("auth.login_failed").target("user", user.pid),
        )
        .await;
        if user.status == "active" {
            if let Ok(updated) =
                users::Model::register_failed_login(&ctx.db, user.id, settings.lockout_threshold)
                    .await
            {
                if updated.status == "locked" {
                    let _ = refresh_tokens::Model::revoke_all_for_user(&ctx.db, user.id).await;
                    let _ = audit::record(
                        &ctx.db,
                        Some(&updated),
                        &meta,
                        Entry::new("auth.account_locked")
                            .target("user", updated.pid)
                            .summary("too many wrong passwords"),
                    )
                    .await;
                }
            }
        }
        return unauthorized(BAD_CREDENTIALS);
    }

    match user.status.as_str() {
        "locked" => {
            return Err(forbidden(
                "account_locked",
                "This account is locked. Contact HR to unlock it.",
            ))
        }
        "disabled" => {
            return Err(forbidden(
                "account_disabled",
                "This account is disabled. Contact HR if you think this is a mistake.",
            ))
        }
        _ => {}
    }

    let user = user
        .into_active_model()
        .record_login_success(&ctx.db)
        .await?;
    let issued = refresh_tokens::Model::issue(
        &ctx.db,
        &settings,
        user.id,
        None,
        params.remember,
        meta.ip.clone(),
    )
    .await?;
    let _ = audit::record(
        &ctx.db,
        Some(&user),
        &meta,
        Entry::new("auth.login").target("user", user.pid),
    )
    .await;
    session_response(&ctx, &settings, &user, &issued)
}

/// Swaps the refresh cookie for a new one and returns a fresh access token.
#[utoipa::path(
    post,
    path = "/api/auth/refresh",
    responses(
        (status = 200, description = "New access token; the refresh cookie is replaced", body = crate::views::auth::SessionResponse),
        (status = 401, description = "No valid refresh cookie"),
    )
)]
#[debug_handler]
pub async fn refresh(
    State(ctx): State<AppContext>,
    meta: RequestMeta,
    headers: HeaderMap,
) -> Result<Response> {
    require_csrf_header(&headers)?;
    let settings = AppSettings::from_ctx(&ctx);
    let Some(secret) = read_cookie(&headers) else {
        return unauthorized_clearing(&settings);
    };

    match refresh_tokens::Model::rotate(&ctx.db, &settings, &secret, meta.ip.clone()).await? {
        Rotation::Invalid => unauthorized_clearing(&settings),
        Rotation::Reused { user_id } => {
            let user = users::Entity::find_by_id(user_id).one(&ctx.db).await?;
            let _ = audit::record(
                &ctx.db,
                user.as_ref(),
                &meta,
                Entry::new("auth.refresh_reuse").summary(
                    "an already used refresh token was presented; the session was revoked",
                ),
            )
            .await;
            unauthorized_clearing(&settings)
        }
        Rotation::Rotated(issued) => {
            let user = users::Entity::find_by_id(issued.user_id)
                .one(&ctx.db)
                .await?;
            match user {
                Some(user) if user.status == "active" => {
                    session_response(&ctx, &settings, &user, &issued)
                }
                _ => {
                    let _ =
                        refresh_tokens::Model::revoke_all_for_user(&ctx.db, issued.user_id).await;
                    unauthorized_clearing(&settings)
                }
            }
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct LogoutQuery {
    #[serde(default)]
    all: bool,
}

/// Ends the session. Always answers 204, even if the cookie was already invalid.
#[utoipa::path(
    post,
    path = "/api/auth/logout",
    params(("all" = Option<bool>, Query, description = "Sign out on every device")),
    responses((status = 204, description = "Signed out; the refresh cookie is deleted"))
)]
#[debug_handler]
pub async fn logout(
    State(ctx): State<AppContext>,
    meta: RequestMeta,
    headers: HeaderMap,
    Query(query): Query<LogoutQuery>,
) -> Result<Response> {
    require_csrf_header(&headers)?;
    let settings = AppSettings::from_ctx(&ctx);

    if let Some(secret) = read_cookie(&headers) {
        if let Some(user_id) = refresh_tokens::Model::revoke_by_secret(&ctx.db, &secret).await? {
            if query.all {
                let _ = refresh_tokens::Model::revoke_all_for_user(&ctx.db, user_id).await;
            }
            let user = users::Entity::find_by_id(user_id).one(&ctx.db).await?;
            let _ = audit::record(
                &ctx.db,
                user.as_ref(),
                &meta,
                Entry::new(if query.all {
                    "auth.logout_all"
                } else {
                    "auth.logout"
                }),
            )
            .await;
        }
    }
    let mut response = Response::default();
    *response.status_mut() = StatusCode::NO_CONTENT;
    clearing(response, &settings)
}

/// Asks for a reset link. The answer is always the same, so nobody can discover which e-mails exist.
#[utoipa::path(
    post,
    path = "/api/auth/forgot",
    request_body = ForgotParams,
    responses((status = 200, description = "Always succeeds", body = MessageResponse))
)]
#[debug_handler]
pub async fn forgot(
    State(ctx): State<AppContext>,
    meta: RequestMeta,
    Json(params): Json<ForgotParams>,
) -> Result<Response> {
    let settings = AppSettings::from_ctx(&ctx);
    if let Ok(user) = users::Model::find_by_email(&ctx.db, &params.email).await {
        if user.status != "disabled" {
            let secret =
                password_resets::Model::issue(&ctx.db, user.id, settings.reset_token_minutes)
                    .await?;
            if let Err(err) = AuthMailer::send_password_reset(&ctx, &user, &secret).await {
                tracing::error!(error = %err, "could not send the password reset email");
            }
            let _ = audit::record(
                &ctx.db,
                Some(&user),
                &meta,
                Entry::new("auth.password_reset_requested").target("user", user.pid),
            )
            .await;
        }
    }
    format::json(MessageResponse {
        message: "If an account exists for that email, a reset link is on its way.".to_owned(),
    })
}

/// Sets a new password using the link from the e-mail.
#[utoipa::path(
    post,
    path = "/api/auth/reset",
    request_body = ResetParams,
    responses(
        (status = 200, description = "Password changed; all sessions were signed out", body = MessageResponse),
        (status = 400, description = "Link invalid or expired, or password too weak"),
    )
)]
#[debug_handler]
pub async fn reset(
    State(ctx): State<AppContext>,
    meta: RequestMeta,
    Json(params): Json<ResetParams>,
) -> Result<Response> {
    if let Err(message) = check_password_strength(&params.password) {
        return bad_request(message);
    }
    let Some(user_id) = password_resets::Model::consume(&ctx.db, &params.token).await? else {
        return bad_request("This link is invalid or has expired. Request a new one.");
    };
    let Some(user) = users::Entity::find_by_id(user_id).one(&ctx.db).await? else {
        return bad_request("This link is invalid or has expired. Request a new one.");
    };

    let user = user
        .into_active_model()
        .set_password(&ctx.db, &params.password, false)
        .await?;
    let _ = refresh_tokens::Model::revoke_all_for_user(&ctx.db, user.id).await;
    let _ = audit::record(
        &ctx.db,
        Some(&user),
        &meta,
        Entry::new("auth.password_reset").target("user", user.pid),
    )
    .await;
    format::json(MessageResponse {
        message: "Your password was changed. Please sign in.".to_owned(),
    })
}

// ---------------------------------------------------------------------------
// Recruitment / V1 Authentication Handlers
// ---------------------------------------------------------------------------

#[debug_handler]
async fn register(
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterParams>,
) -> Result<Response> {
    let res = users::Model::create_with_password(&ctx.db, &params).await;

    let user = match res {
        Ok(user) => user,
        Err(err) => {
            tracing::info!(
                error = err.to_string(),
                email = params.email,
                "could not register user"
            );
            return bad_request("could not register user");
        }
    };

    let user = user
        .into_active_model()
        .set_email_verification_sent(&ctx.db)
        .await?;

    AuthMailer::send_welcome(&ctx, &user).await?;

    format::empty()
}

#[debug_handler]
async fn v1_register(
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterParams>,
) -> Result<Response> {
    let res = users::Model::create_with_password(&ctx.db, &params).await;

    let user = match res {
        Ok(user) => user,
        Err(err) => {
            tracing::info!(
                error = err.to_string(),
                email = params.email,
                "could not register user"
            );
            return bad_request("could not register user");
        }
    };

    let user = user
        .into_active_model()
        .set_email_verification_sent(&ctx.db)
        .await?;

    AuthMailer::send_welcome(&ctx, &user).await?;

    let jwt_secret = ctx.config.get_jwt_config()?;
    let token = user.generate_jwt(&jwt_secret.secret, jwt_secret.expiration)?;

    format::json(V1LoginResponse::new(&user, &token))
}

#[debug_handler]
async fn verify(State(ctx): State<AppContext>, Path(token): Path<String>) -> Result<Response> {
    let user = users::Model::find_by_verification_token(&ctx.db, &token).await?;

    if user.email_verified_at.is_some() {
        tracing::info!(
            pid = user.pid.to_string(),
            "user already verified their email"
        );
    } else {
        user.into_active_model().verified(&ctx.db).await?;
    }

    format::empty()
}

#[derive(Debug, Deserialize)]
pub struct VerifyParams {
    pub token: String,
}

#[debug_handler]
async fn verify_post(
    State(ctx): State<AppContext>,
    Json(params): Json<VerifyParams>,
) -> Result<Response> {
    let user = match users::Model::find_by_verification_token(&ctx.db, &params.token).await {
        Ok(user) => user,
        Err(_) => return bad_request("invalid or expired verification token"),
    };

    if user.email_verified_at.is_some() {
        tracing::info!(
            pid = user.pid.to_string(),
            "user already verified their email"
        );
    } else {
        user.into_active_model().verified(&ctx.db).await?;
    }

    format::json(serde_json::json!({
        "status": "success",
        "message": "Email verified successfully"
    }))
}

#[debug_handler]
async fn v1_login(
    State(ctx): State<AppContext>,
    Json(params): Json<LoginParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_email(&ctx.db, &params.email).await else {
        tracing::debug!(
            email = params.email,
            "login attempt with non-existent email"
        );
        return unauthorized("Invalid credentials!");
    };

    if !user.verify_password(&params.password) {
        return unauthorized("Invalid credentials!");
    }

    let jwt_secret = ctx.config.get_jwt_config()?;
    let token = match user.generate_jwt(&jwt_secret.secret, jwt_secret.expiration) {
        Ok(t) => t,
        Err(e) => {
            tracing::error!("JWT generation error: {:?}", e);
            return unauthorized(format!("JWT error: {:?}", e));
        }
    };

    format::json(V1LoginResponse::new(&user, &token))
}

#[debug_handler]
async fn current(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    format::json(CurrentResponse::new(&user))
}

#[debug_handler]
async fn v1_current(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    format::json(V1CurrentResponse::new(&user))
}

#[derive(Debug, Deserialize)]
pub struct MagicLinkParams {
    pub email: String,
}

#[debug_handler]
async fn magic_link(
    State(ctx): State<AppContext>,
    Json(params): Json<MagicLinkParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_email(&ctx.db, &params.email).await else {
        return unauthorized("User not found");
    };

    let user = user.into_active_model().create_magic_link(&ctx.db).await?;
    AuthMailer::send_magic_link(&ctx, &user).await?;

    format::empty()
}

#[debug_handler]
async fn magic_link_verify(
    State(ctx): State<AppContext>,
    Path(token): Path<String>,
) -> Result<Response> {
    let user = users::Model::find_by_magic_token(&ctx.db, &token).await?;
    let user = user.into_active_model().clear_magic_link(&ctx.db).await?;

    let jwt_secret = ctx.config.get_jwt_config()?;
    let token = user.generate_jwt(&jwt_secret.secret, jwt_secret.expiration)?;

    format::json(LoginResponse::new(&user, &token))
}

#[derive(Debug, Deserialize)]
pub struct ResendVerificationParams {
    pub email: String,
}

#[debug_handler]
async fn resend_verification(
    State(ctx): State<AppContext>,
    Json(params): Json<ResendVerificationParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_email(&ctx.db, &params.email).await else {
        return unauthorized("User not found");
    };

    if user.email_verified_at.is_some() {
        return bad_request("Email already verified");
    }

    let user = user
        .into_active_model()
        .set_email_verification_sent(&ctx.db)
        .await?;

    AuthMailer::send_welcome(&ctx, &user).await?;

    format::empty()
}

#[debug_handler]
async fn v1_logout() -> Result<Response> {
    format::empty()
}

pub fn routes(ctx: &AppContext) -> Routes {
    let limiter = IpRateLimit::per_minute(AppSettings::from_ctx(ctx).auth_rate_limit_per_minute);
    Routes::new()
        .prefix("/api/auth")
        .add("/login", post(login))
        .add("/refresh", post(refresh))
        .add("/logout", post(logout))
        .add("/forgot", post(forgot))
        .add("/reset", post(reset))
        .add("/signup", post(register))
        .add("/register", post(register))
        .add("/verify/{token}", get(verify))
        .add("/verify", post(verify_post))
        .add("/current", get(current))
        .add("/me", get(current))
        .add("/magic-link", post(magic_link))
        .add("/magic-link/{token}", get(magic_link_verify))
        .add("/resend-verification-mail", post(resend_verification))
        .layer(from_fn_with_state(limiter, rate_limit))
}

pub fn v1_routes() -> Routes {
    Routes::new()
        .prefix("/api/v1/auth")
        .add("/signup", post(v1_register))
        .add("/register", post(v1_register))
        .add("/verify/{token}", get(verify))
        .add("/verify", post(verify_post))
        .add("/login", post(v1_login))
        .add("/logout", post(v1_logout))
        .add("/forgot", post(forgot))
        .add("/reset", post(reset))
        .add("/current", get(v1_current))
        .add("/me", get(v1_current))
        .add("/magic-link", post(magic_link))
        .add("/magic-link/{token}", get(magic_link_verify))
        .add("/resend-verification-mail", post(resend_verification))
}
