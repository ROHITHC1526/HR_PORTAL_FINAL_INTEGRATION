use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "employees")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_name = "id")]
    pub employee_code: String,
    #[sea_orm(column_name = "name")]
    pub full_name: String,
    #[sea_orm(column_name = "role")]
    pub job_title: String,
    pub department: String,
    #[sea_orm(nullable)]
    pub grade: Option<String>,
    #[sea_orm(nullable)]
    pub location: Option<String>,
    #[sea_orm(nullable, column_name = "manager")]
    pub manager_name: Option<String>,
    pub status: String,
    #[sea_orm(nullable, column_name = "email")]
    pub work_email: Option<String>,
    #[sea_orm(nullable, column_name = "joined_date")]
    pub joined: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
