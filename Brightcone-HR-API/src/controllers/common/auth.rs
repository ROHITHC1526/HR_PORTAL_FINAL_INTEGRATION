use axum::{
    extract::Extension,
    http::{header, HeaderMap},
    Json,
};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::{SharedState, User};

// ---------------------------------------------------------------------------
// DTOs & Request Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct LoginPayload {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterPayload {
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: User,
    pub token: String,
}

// ---------------------------------------------------------------------------
// Auth Helpers
// ---------------------------------------------------------------------------

pub async fn get_authenticated_user_api(
    headers: &HeaderMap,
    repo: &crate::database::repository::DatabaseRepository,
) -> Option<User> {
    if let Some(auth_hdr) = headers.get(header::AUTHORIZATION) {
        if let Ok(auth_str) = auth_hdr.to_str() {
            if let Some(token) = auth_str.strip_prefix("Bearer ") {
                let token = token.trim().to_lowercase();
                if let Ok(Some(user)) = repo.get_user_by_email(&token).await {
                    return Some(user);
                }
            }
        }
    }

    if let Some(cookie_hdr) = headers.get(header::COOKIE) {
        if let Ok(cookie_str) = cookie_hdr.to_str() {
            for part in cookie_str.split(';') {
                let part = part.trim();
                if let Some(val) = part.strip_prefix("brightcone_user=") {
                    let decoded_email = val.replace("%40", "@").replace('+', " ");
                    if let Ok(Some(user)) = repo.get_user_by_email(&decoded_email).await {
                        return Some(user);
                    }
                }
            }
        }
    }

    None
}

// ---------------------------------------------------------------------------
// Route Handlers: Authentication
// ---------------------------------------------------------------------------

#[debug_handler]
pub async fn api_login(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<LoginPayload>,
) -> Result<Response> {
    let user_opt = state
        .repo
        .get_user_by_email(&payload.email)
        .await
        .map_err(|e| Error::string(&format!("Database query failed: {e}")))?;

    if let Some(user) = user_opt {
        if crate::database::seed::verify_password(&payload.password, &user.password) {
            let cookie_val = format!(
                "brightcone_user={}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400",
                user.email
            );
            let resp_data = AuthResponse {
                token: user.email.clone(),
                user,
            };
            let mut resp = format::json(resp_data)?;
            if let Ok(hdr) = cookie_val.parse() {
                resp.headers_mut().insert(header::SET_COOKIE, hdr);
            }
            return Ok(resp);
        }
    }

    Err(Error::Unauthorized("Invalid email or password".to_string()))
}

#[debug_handler]
pub async fn api_register(
    Extension(state): Extension<SharedState>,
    Json(payload): Json<RegisterPayload>,
) -> Result<Response> {
    let role = payload.role.unwrap_or_else(|| "Recruiter".to_string());
    let hashed_password = crate::database::seed::hash_password(&payload.password);

    match state
        .repo
        .create_user(payload.name, payload.email, hashed_password, role)
        .await
    {
        Ok(user) => {
            let cookie_val = format!(
                "brightcone_user={}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400",
                user.email
            );
            let resp_data = AuthResponse {
                token: user.email.clone(),
                user,
            };
            let mut resp = format::json(resp_data)?;
            if let Ok(hdr) = cookie_val.parse() {
                resp.headers_mut().insert(header::SET_COOKIE, hdr);
            }
            Ok(resp)
        }
        Err(err) => Err(Error::BadRequest(err.to_string())),
    }
}

#[debug_handler]
pub async fn api_logout() -> Result<Response> {
    let cookie_val = "brightcone_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    let mut resp = format::json(serde_json::json!({ "message": "Signed out successfully" }))?;
    if let Ok(hdr) = cookie_val.parse() {
        resp.headers_mut().insert(header::SET_COOKIE, hdr);
    }
    Ok(resp)
}

#[debug_handler]
pub async fn api_me(
    Extension(state): Extension<SharedState>,
    headers: HeaderMap,
) -> Result<Response> {
    if let Some(user) = get_authenticated_user_api(&headers, &state.repo).await {
        format::json(serde_json::json!({ "user": user }))
    } else {
        let users = state.repo.list_users().await.unwrap_or_default();
        if let Some(first_user) = users.first() {
            format::json(serde_json::json!({ "user": first_user }))
        } else {
            Err(Error::Unauthorized("Not authenticated".to_string()))
        }
    }
}
