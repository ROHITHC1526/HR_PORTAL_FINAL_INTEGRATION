use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "course_reminders")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    pub assignment_id: String,
    pub course_id: String,
    pub employee_id: String,
    pub sent_by: String,
    pub status: String, // "Queued", "Processing", "Delivered", "Failed", "Skipped"
    pub reason: Option<String>,
    pub claimed_at: Option<DateTimeWithTimeZone>,
    pub retry_count: i32,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
