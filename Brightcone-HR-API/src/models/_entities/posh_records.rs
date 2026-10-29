use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "posh_records")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    pub rtype: String,         // "Committee member" or "Training session"
    pub emp: Option<String>,   // Employee ID
    pub name: String,          // Name or session title
    pub role: Option<String>, // "Presiding officer", "Member", "External member", "Trainer", "Session"
    pub date: String,         // Appointed on / session date (YYYY-MM-DD)
    pub valid: Option<String>, // Valid till date (YYYY-MM-DD)
    pub parts: Option<i32>,   // Participants
    pub status: String,       // "Active", "Scheduled", "Completed"
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
