use async_trait::async_trait;
use chrono::{offset::Local, Duration, Utc};
use loco_rs::{auth::jwt, hash, prelude::*};
use serde::{Deserialize, Serialize};
use serde_json::Map;
use uuid::Uuid;

pub use super::_entities::users::{self, ActiveModel, Entity, Model};
use crate::authz::Role;

pub const MAGIC_LINK_LENGTH: i8 = 32;
pub const MAGIC_LINK_EXPIRATION_MIN: i8 = 5;
pub const RESET_TOKEN_EXPIRATION_MIN: i64 = 30;
pub const MIN_PASSWORD_LEN: usize = 12;

/// Passwords nobody may use even if they are long enough.
const COMMON_PASSWORDS: &[&str] = &[
    "password1234",
    "password12345",
    "123456789012",
    "qwertyuiop12",
    "welcome12345",
    "letmein12345",
    "administrator",
    "iloveyou1234",
    "changeme1234",
    "brightcone123",
];

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
pub struct LoginParams {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RegisterParams {
    pub email: String,
    pub password: String,
    pub name: String,
}

/// What HR supplies to create an account.
#[derive(Debug, Clone)]
pub struct NewUser {
    pub email: String,
    pub name: String,
    pub password: String,
    pub role: Role,
    pub must_change_password: bool,
}

pub trait UserCreateParams {
    fn email(&self) -> &str;
    fn name(&self) -> &str;
    fn password(&self) -> &str;
    fn role(&self) -> String;
    fn must_change_password(&self) -> bool;
}

impl UserCreateParams for RegisterParams {
    fn email(&self) -> &str {
        &self.email
    }
    fn name(&self) -> &str {
        &self.name
    }
    fn password(&self) -> &str {
        &self.password
    }
    fn role(&self) -> String {
        "employee".to_string()
    }
    fn must_change_password(&self) -> bool {
        false
    }
}

impl UserCreateParams for NewUser {
    fn email(&self) -> &str {
        &self.email
    }
    fn name(&self) -> &str {
        &self.name
    }
    fn password(&self) -> &str {
        &self.password
    }
    fn role(&self) -> String {
        self.role.as_str().to_string()
    }
    fn must_change_password(&self) -> bool {
        self.must_change_password
    }
}

#[derive(Debug, Validate, Deserialize)]
pub struct Validator {
    #[validate(length(min = 2, max = 200, message = "Name must be 2 to 200 characters long."))]
    pub name: String,
    #[validate(email(message = "invalid email"), length(max = 254))]
    pub email: String,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn Validate> {
        Box::new(Validator {
            name: self.name.as_ref().to_owned(),
            email: self.email.as_ref().to_owned(),
        })
    }
}

/// Lower-case and trim. Used for every e-mail we store or look up.
#[must_use]
pub fn normalize_email(email: &str) -> String {
    email.trim().to_lowercase()
}

/// Password rules (ticket P1-07): at least 12 characters, not a well-known password, not one
/// repeated character.
pub fn check_password_strength(password: &str) -> Result<(), &'static str> {
    if password.chars().count() < MIN_PASSWORD_LEN {
        return Err("Password must be at least 12 characters long.");
    }
    let lower = password.to_lowercase();
    if COMMON_PASSWORDS.contains(&lower.as_str()) {
        return Err("That password is too common. Choose another.");
    }
    let first = password.chars().next();
    if password.chars().all(|c| Some(c) == first) {
        return Err("Password must not be a single repeated character.");
    }
    Ok(())
}

#[async_trait::async_trait]
impl ActiveModelBehavior for super::_entities::users::ActiveModel {
    async fn before_save<C>(mut self, _db: &C, insert: bool) -> Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if let ActiveValue::Set(email) = &self.email {
            self.email = ActiveValue::Set(normalize_email(email));
        }
        self.validate()?;
        let now = Utc::now();
        if insert {
            if !self.pid.is_set() {
                self.pid = ActiveValue::Set(Uuid::new_v4());
            }
            if !self.api_key.is_set() {
                self.api_key = ActiveValue::Set(format!("lo-{}", Uuid::new_v4()));
            }
            if !self.role.is_set() {
                self.role = ActiveValue::Set("employee".to_string());
            }
            if !self.created_at.is_set() {
                self.created_at = ActiveValue::Set(now.into());
            }
            if !self.updated_at.is_set() {
                self.updated_at = ActiveValue::Set(now.into());
            }
        } else {
            self.updated_at = ActiveValue::Set(now.into());
        }
        Ok(self)
    }
}

#[async_trait]
impl Authenticable for Model {
    async fn find_by_api_key(db: &DatabaseConnection, api_key: &str) -> ModelResult<Self> {
        Self::find_by_api_key(db, api_key).await
    }

    async fn find_by_claims_key(db: &DatabaseConnection, claims_key: &str) -> ModelResult<Self> {
        Self::find_by_pid(db, claims_key).await
    }
}

impl Model {
    /// finds a user by the provided email (case-insensitive and trimmed)
    pub async fn find_by_email(db: &DatabaseConnection, email: &str) -> ModelResult<Self> {
        let norm = normalize_email(email);
        users::Entity::find()
            .filter(users::Column::Email.eq(&norm))
            .one(db)
            .await?
            .ok_or(ModelError::EntityNotFound)
    }

    /// finds a user by the provided verification token
    pub async fn find_by_verification_token(
        db: &DatabaseConnection,
        token: &str,
    ) -> ModelResult<Self> {
        let user = users::Entity::find()
            .filter(
                model::query::condition()
                    .eq(users::Column::EmailVerificationToken, token)
                    .build(),
            )
            .one(db)
            .await?;
        user.ok_or_else(|| ModelError::EntityNotFound)
    }

    /// finds a user by the magic token and verify and token expiration
    pub async fn find_by_magic_token(db: &DatabaseConnection, token: &str) -> ModelResult<Self> {
        let user = users::Entity::find()
            .filter(
                query::condition()
                    .eq(users::Column::MagicLinkToken, token)
                    .build(),
            )
            .one(db)
            .await?;

        let user = user.ok_or_else(|| ModelError::EntityNotFound)?;
        if let Some(expired_at) = user.magic_link_expiration {
            if expired_at >= Local::now() {
                Ok(user)
            } else {
                tracing::debug!(
                    user_pid = user.pid.to_string(),
                    token_expiration = expired_at.to_string(),
                    "magic token expired for the user."
                );
                Err(ModelError::msg("magic token expired"))
            }
        } else {
            tracing::error!(
                user_pid = user.pid.to_string(),
                "magic link expiration time not exists"
            );
            Err(ModelError::msg("expiration token not exists"))
        }
    }

    /// finds a user by the provided reset token
    pub async fn find_by_reset_token(db: &DatabaseConnection, token: &str) -> ModelResult<Self> {
        let user = users::Entity::find()
            .filter(
                model::query::condition()
                    .eq(users::Column::ResetToken, token)
                    .build(),
            )
            .one(db)
            .await?;

        let user = user.ok_or_else(|| ModelError::EntityNotFound)?;
        if let Some(sent_at) = user.reset_sent_at {
            if sent_at + Duration::minutes(RESET_TOKEN_EXPIRATION_MIN) >= Local::now() {
                Ok(user)
            } else {
                tracing::debug!(
                    user_pid = user.pid.to_string(),
                    "reset token expired for the user."
                );
                Err(ModelError::msg("reset token expired"))
            }
        } else {
            tracing::error!(
                user_pid = user.pid.to_string(),
                "reset token sent time does not exist"
            );
            Err(ModelError::msg("reset token sent time not exists"))
        }
    }

    /// finds a user by the provided pid
    pub async fn find_by_pid(db: &DatabaseConnection, pid: &str) -> ModelResult<Self> {
        let parse_uuid = Uuid::parse_str(pid).map_err(|e| ModelError::Any(e.into()))?;
        let user = users::Entity::find()
            .filter(users::Column::Pid.eq(parse_uuid))
            .one(db)
            .await?;
        user.ok_or_else(|| ModelError::EntityNotFound)
    }

    /// finds a user by the provided api key
    pub async fn find_by_api_key(db: &DatabaseConnection, api_key: &str) -> ModelResult<Self> {
        let user = users::Entity::find()
            .filter(users::Column::ApiKey.eq(api_key))
            .one(db)
            .await?;
        user.ok_or_else(|| ModelError::EntityNotFound)
    }

    /// Verifies whether the provided plain password matches the hashed password
    #[must_use]
    pub fn verify_password(&self, password: &str) -> bool {
        if self.password.starts_with("$sha256$") {
            crate::database::seed::verify_password(password, &self.password)
        } else if hash::verify_password(password, &self.password) {
            true
        } else {
            self.password == password
        }
    }

    #[must_use]
    pub fn role(&self) -> Option<Role> {
        Role::parse(&self.role)
    }

    /// Asynchronously creates a user with a password and saves it to the database.
    pub async fn create_with_password<P: UserCreateParams>(
        db: &DatabaseConnection,
        params: &P,
    ) -> ModelResult<Self> {
        let txn = db.begin().await?;
        let email = normalize_email(params.email());

        if users::Entity::find()
            .filter(users::Column::Email.eq(&email))
            .one(&txn)
            .await?
            .is_some()
        {
            return Err(ModelError::EntityAlreadyExists {});
        }

        let password_hash =
            hash::hash_password(params.password()).map_err(|e| ModelError::Any(e.into()))?;
        let user = users::ActiveModel {
            email: ActiveValue::set(email),
            password: ActiveValue::set(password_hash),
            name: ActiveValue::set(params.name().trim().to_owned()),
            role: ActiveValue::set(params.role()),
            status: ActiveValue::set("active".to_owned()),
            must_change_password: ActiveValue::set(params.must_change_password()),
            email_verification_token: ActiveValue::set(Some(Uuid::new_v4().to_string())),
            email_verification_sent_at: ActiveValue::set(Some(Local::now().into())),
            email_verified_at: ActiveValue::set(None),
            ..Default::default()
        }
        .insert(&txn)
        .await?;

        txn.commit().await?;

        Ok(user)
    }

    /// Creates a JWT
    pub fn generate_jwt(&self, secret: &str, expiration: u64) -> ModelResult<String> {
        jwt::JWT::new(secret)
            .generate_token(expiration, self.pid.to_string(), Map::new())
            .map_err(ModelError::from)
    }

    /// Counts a wrong password and locks the account when `threshold` is reached.
    pub async fn register_failed_login(
        db: &DatabaseConnection,
        id: i64,
        threshold: i32,
    ) -> ModelResult<Self> {
        let txn = db.begin().await?;
        let user = users::Entity::find_by_id(id)
            .lock_exclusive()
            .one(&txn)
            .await?
            .ok_or(ModelError::EntityNotFound)?;
        let failed = user.failed_logins.saturating_add(1);
        let lock_now = failed >= threshold && user.status == "active";
        let mut active = user.into_active_model();
        active.failed_logins = ActiveValue::set(failed);
        if lock_now {
            active.status = ActiveValue::set("locked".to_owned());
            active.locked_at = ActiveValue::set(Some(Local::now().into()));
        }
        let updated = active.update(&txn).await?;
        txn.commit().await?;
        Ok(updated)
    }
}

impl ActiveModel {
    pub async fn set_email_verification_sent(
        mut self,
        db: &DatabaseConnection,
    ) -> ModelResult<Model> {
        self.email_verification_sent_at = ActiveValue::set(Some(Local::now().into()));
        self.email_verification_token = ActiveValue::Set(Some(Uuid::new_v4().to_string()));
        self.update(db).await.map_err(ModelError::from)
    }

    pub async fn set_forgot_password_sent(mut self, db: &DatabaseConnection) -> ModelResult<Model> {
        self.reset_sent_at = ActiveValue::set(Some(Local::now().into()));
        self.reset_token = ActiveValue::Set(Some(Uuid::new_v4().to_string()));
        self.update(db).await.map_err(ModelError::from)
    }

    pub async fn verified(mut self, db: &DatabaseConnection) -> ModelResult<Model> {
        self.email_verified_at = ActiveValue::set(Some(Local::now().into()));
        self.email_verification_token = ActiveValue::Set(None);
        self.update(db).await.map_err(ModelError::from)
    }

    pub async fn reset_password(
        mut self,
        db: &DatabaseConnection,
        password: &str,
    ) -> ModelResult<Model> {
        self.password =
            ActiveValue::set(hash::hash_password(password).map_err(|e| ModelError::Any(e.into()))?);
        self.reset_token = ActiveValue::Set(None);
        self.reset_sent_at = ActiveValue::Set(None);
        self.update(db).await.map_err(ModelError::from)
    }

    pub async fn create_magic_link(mut self, db: &DatabaseConnection) -> ModelResult<Model> {
        let random_str = hash::random_string(MAGIC_LINK_LENGTH as usize);
        let expired = Local::now() + Duration::minutes(MAGIC_LINK_EXPIRATION_MIN.into());

        self.magic_link_token = ActiveValue::set(Some(random_str));
        self.magic_link_expiration = ActiveValue::set(Some(expired.into()));
        self.update(db).await.map_err(ModelError::from)
    }

    pub async fn clear_magic_link(mut self, db: &DatabaseConnection) -> ModelResult<Model> {
        self.magic_link_token = ActiveValue::set(None);
        self.magic_link_expiration = ActiveValue::set(None);
        self.update(db).await.map_err(ModelError::from)
    }

    pub async fn record_login_success(mut self, db: &DatabaseConnection) -> ModelResult<Model> {
        self.failed_logins = ActiveValue::set(0);
        self.last_login_at = ActiveValue::set(Some(Local::now().into()));
        Ok(self.update(db).await?)
    }

    pub async fn set_password<C: ConnectionTrait>(
        mut self,
        db: &C,
        password: &str,
        must_change: bool,
    ) -> ModelResult<Model> {
        self.password =
            ActiveValue::set(hash::hash_password(password).map_err(|e| ModelError::Any(e.into()))?);
        self.must_change_password = ActiveValue::set(must_change);
        self.password_changed_at = ActiveValue::set(Some(Local::now().into()));
        Ok(self.update(db).await?)
    }

    pub async fn set_status<C: ConnectionTrait>(
        mut self,
        db: &C,
        status: &str,
    ) -> ModelResult<Model> {
        self.status = ActiveValue::set(status.to_owned());
        self.failed_logins = ActiveValue::set(0);
        self.locked_at = ActiveValue::set(if status == "locked" {
            Some(Local::now().into())
        } else {
            None
        });
        Ok(self.update(db).await?)
    }
}
