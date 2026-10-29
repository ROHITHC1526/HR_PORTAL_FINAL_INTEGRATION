use crate::db::schema::schema::{EntitySchema, TableSchema};
use crate::modules::time::models::{
    AttendanceCorrectionRequest, CompOffEntitlement, CompOffRequest, DailyAttendanceRecord,
    Employee, Holiday, LeaveQuota, LeaveRequest, LeaveType, RosterAssignment, RosterPublication,
    Shift, SwapRequest, WorkFromHomeRequest,
};
use std::collections::{HashMap, HashSet};

/// Registry of all database-backed entities in the application.
/// Provides a deterministic, dependency-ordered manifest of tables for schema synchronization.
pub struct EntityManifest;

impl EntityManifest {
    /// Returns all registered entity schemas in deterministic, dependency-safe topological order.
    pub fn all() -> Vec<TableSchema> {
        vec![
            Shift::schema(),
            Holiday::schema(),
            LeaveType::schema(),
            LeaveQuota::schema(),
            Employee::schema(),
            RosterAssignment::schema(),
            RosterPublication::schema(),
            SwapRequest::schema(),
            DailyAttendanceRecord::schema(),
            AttendanceCorrectionRequest::schema(),
            LeaveRequest::schema(),
            WorkFromHomeRequest::schema(),
            CompOffEntitlement::schema(),
            CompOffRequest::schema(),
        ]
    }

    /// Validates the internal consistency and referential integrity of the manifest.
    pub fn validate(schemas: &[TableSchema]) -> Result<(), String> {
        let mut table_names = HashSet::new();
        let mut table_map = HashMap::new();

        for schema in schemas {
            if !table_names.insert(&schema.name) {
                return Err(format!(
                    "Duplicate table registration in manifest: '{}'",
                    schema.name
                ));
            }
            table_map.insert(&schema.name, schema);
        }

        for schema in schemas {
            let mut col_names = HashSet::new();
            for col in &schema.columns {
                if !col_names.insert(&col.name) {
                    return Err(format!(
                        "Duplicate column '{}' in table '{}'",
                        col.name, schema.name
                    ));
                }
            }

            for pk in &schema.primary_key {
                if !col_names.contains(pk) {
                    return Err(format!(
                        "Primary key '{}' in table '{}' does not match any column",
                        pk, schema.name
                    ));
                }
            }

            for fk in &schema.foreign_keys {
                if !col_names.contains(&fk.column) {
                    return Err(format!(
                        "Foreign key '{}' in table '{}' references non-existent column '{}'",
                        fk.name, schema.name, fk.column
                    ));
                }
                if !table_names.contains(&fk.foreign_table) {
                    return Err(format!(
                        "Foreign key '{}' in table '{}' references unregistered table '{}'",
                        fk.name, schema.name, fk.foreign_table
                    ));
                }
            }

            for idx in &schema.indexes {
                for col in &idx.columns {
                    if !col_names.contains(col) {
                        return Err(format!(
                            "Index '{}' on table '{}' references non-existent column '{}'",
                            idx.name, schema.name, col
                        ));
                    }
                }
            }

            for uq in &schema.unique_constraints {
                for col in &uq.columns {
                    if !col_names.contains(col) {
                        return Err(format!(
                            "Unique constraint '{}' on table '{}' references non-existent column '{}'",
                            uq.name, schema.name, col
                        ));
                    }
                }
            }
        }

        Ok(())
    }
}
