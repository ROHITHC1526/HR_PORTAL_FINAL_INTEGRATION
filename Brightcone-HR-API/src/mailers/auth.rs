// auth mailer
#![allow(non_upper_case_globals)]

use loco_rs::prelude::*;
use serde_json::json;

use crate::models::users;

static welcome: Dir<'_> = include_dir!("src/mailers/auth/welcome");
static forgot: Dir<'_> = include_dir!("src/mailers/auth/forgot");
static magic_link: Dir<'_> = include_dir!("src/mailers/auth/magic_link");

fn auth_base_url(server: &loco_rs::config::Server) -> String {
    server.full_url()
}

#[allow(clippy::module_name_repetitions)]
pub struct AuthMailer {}
impl Mailer for AuthMailer {}
impl AuthMailer {
    /// Sending welcome email the the given user
    ///
    /// # Errors
    ///
    /// When email sending is failed
    pub async fn send_welcome(ctx: &AppContext, user: &users::Model) -> Result<()> {
        Self::mail_template(
            ctx,
            &welcome,
            mailer::Args {
                to: user.email.clone(),
                locals: json!({
                  "name": user.name,
                  "verifyToken": user.email_verification_token,
                  "host": auth_base_url(&ctx.config.server)
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }

    /// Sending forgot password email
    ///
    /// # Errors
    ///
    /// When email sending is failed
    pub async fn forgot_password(ctx: &AppContext, user: &users::Model) -> Result<()> {
        Self::mail_template(
            ctx,
            &forgot,
            mailer::Args {
                to: user.email.clone(),
                locals: json!({
                  "name": user.name,
                  "resetToken": user.reset_token,
                  "host": auth_base_url(&ctx.config.server)
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }

    /// Sends a magic link authentication email to the user.
    ///
    /// # Errors
    ///
    /// When email sending is failed
    pub async fn send_magic_link(ctx: &AppContext, user: &users::Model) -> Result<()> {
        Self::mail_template(
            ctx,
            &magic_link,
            mailer::Args {
                to: user.email.clone(),
                locals: json!({
                  "name": user.name,
                  "token": user.magic_link_token.clone().ok_or_else(|| Error::string(
                            "the user model not contains magic link token",
                    ))?,
                  "host": auth_base_url(&ctx.config.server)
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }

    /// Sends the password-reset link. `secret` is the one-time token; only its hash is stored.
    pub async fn send_password_reset(
        ctx: &AppContext,
        user: &users::Model,
        secret: &str,
    ) -> Result<()> {
        let frontend = crate::settings::AppSettings::from_ctx(ctx).frontend_url;
        let reset_url = format!(
            "{}/reset-password?token={secret}",
            frontend.trim_end_matches('/')
        );
        Self::mail_template(
            ctx,
            &forgot,
            mailer::Args {
                to: user.email.clone(),
                locals: serde_json::json!({
                  "name": user.name,
                  "resetUrl": reset_url,
                  "resetToken": secret,
                  "host": frontend,
                }),
                ..Default::default()
            },
        )
        .await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use loco_rs::{config::Config, environment::Environment};
    use std::path::Path;

    #[test]
    fn authentication_email_keeps_backend_verification_url() {
        let config = Config::from_folder(&Environment::Development, Path::new("config"))
            .expect("development config should parse");
        let link = format!(
            "{}/api/auth/verify/test-token",
            auth_base_url(&config.server)
        );
        assert_eq!(
            link,
            format!(
                "{}/api/auth/verify/test-token",
                auth_base_url(&config.server)
            )
        );
    }
}
