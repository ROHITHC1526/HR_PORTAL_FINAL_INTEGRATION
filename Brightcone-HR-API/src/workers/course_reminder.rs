use crate::models::_entities::{
    course_assignments::Entity as CourseAssignmentsEntity,
    courses::Entity as CoursesEntity,
    employees::{self, Entity as EmployeesEntity},
    security_trainings::Entity as SecurityTrainingsEntity,
};
use loco_rs::prelude::*;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};

pub struct CourseReminderWorker {
    pub ctx: AppContext,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct CourseReminderWorkerArgs {
    pub reminder_id: String,
    pub assignment_id: String,
    pub employee_id: String,
    pub course_id: String,
}

#[async_trait]
impl BackgroundWorker<CourseReminderWorkerArgs> for CourseReminderWorker {
    fn build(ctx: &AppContext) -> Self {
        Self { ctx: ctx.clone() }
    }

    async fn perform(&self, args: CourseReminderWorkerArgs) -> Result<()> {
        // Safe atomic conditional job claiming & concurrency protection:
        // Reads alone do not protect against race conditions.
        // We atomically transition a single outbox record from 'Queued' (or stale 'Processing')
        // to 'Processing' while recording claimed_at = CURRENT_TIMESTAMP and enforcing bounded retries (< 3).
        // Interrupted/stale claims older than 5 minutes can be recovered.
        let claim_sql = r#"
            UPDATE course_reminders
            SET status = 'Processing',
                claimed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
              AND (
                  status = 'Queued'
                  OR (status = 'Processing' AND claimed_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes')
              )
              AND retry_count < 3
            RETURNING id, assignment_id, course_id, employee_id, sent_by, status, retry_count;
        "#;

        let claimed_row = self
            .ctx
            .db
            .query_one_raw(sea_orm::Statement::from_sql_and_values(
                self.ctx.db.get_database_backend(),
                claim_sql,
                vec![args.reminder_id.clone().into()],
            ))
            .await?;

        let Some(row) = claimed_row else {
            tracing::info!(
                reminder_id = %args.reminder_id,
                "Reminder job already claimed by concurrent worker, completed, or exceeded max retries; skipping duplicate execution."
            );
            return Ok(());
        };

        let current_retry_count: i32 = row.try_get("", "retry_count").unwrap_or(0);

        // Delivery-time eligibility and completion recheck:
        // Distinguish standard course assignments from security trainings (prefixed with SEC-)
        let is_completed = if args.assignment_id.starts_with("SEC-") {
            let raw_id = &args.assignment_id[4..];
            let sec = SecurityTrainingsEntity::find_by_id(raw_id)
                .one(&self.ctx.db)
                .await?;
            sec.map(|s| s.status == "Completed").unwrap_or(false)
        } else {
            let assign = CourseAssignmentsEntity::find_by_id(&args.assignment_id)
                .one(&self.ctx.db)
                .await?;
            assign
                .map(|a| a.progress >= 100 || a.status == "Completed")
                .unwrap_or(false)
        };

        if is_completed {
            let update_skip_sql = r#"
                UPDATE course_reminders
                SET status = 'Skipped',
                    reason = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1;
            "#;
            let reason = if args.assignment_id.starts_with("SEC-") {
                "Security training completed prior to delivery"
            } else {
                "Course completed prior to delivery"
            };
            let _ = self
                .ctx
                .db
                .execute_raw(sea_orm::Statement::from_sql_and_values(
                    self.ctx.db.get_database_backend(),
                    update_skip_sql,
                    vec![args.reminder_id.clone().into(), reason.into()],
                ))
                .await?;
            tracing::info!(
                reminder_id = %args.reminder_id,
                assignment_id = %args.assignment_id,
                "Marked reminder as Skipped because training was completed prior to delivery."
            );
            return Ok(());
        }

        // Resolve recipient employee full name and destination email
        let (emp_name, emp_email) = match EmployeesEntity::find()
            .filter(employees::Column::EmployeeCode.eq(&args.employee_id))
            .one(&self.ctx.db)
            .await?
        {
            Some(e) => (
                e.full_name,
                e.work_email
                    .unwrap_or_else(|| format!("{}@example.com", args.employee_id.to_lowercase())),
            ),
            None => (
                "Employee".to_string(),
                format!("{}@example.com", args.employee_id.to_lowercase()),
            ),
        };

        // Resolve course or security training title
        let (course_title, due_date) = match CoursesEntity::find_by_id(&args.course_id)
            .one(&self.ctx.db)
            .await?
        {
            Some(c) => (c.title, c.due_date),
            None => {
                if args.assignment_id.starts_with("SEC-") {
                    let raw_id = &args.assignment_id[4..];
                    match SecurityTrainingsEntity::find_by_id(raw_id)
                        .one(&self.ctx.db)
                        .await?
                    {
                        Some(s) => (s.course, s.due),
                        None => ("Security Training".to_string(), None),
                    }
                } else {
                    ("Course".to_string(), None)
                }
            }
        };

        // Inspect transport configuration
        let is_smtp_enabled = self
            .ctx
            .config
            .mailer
            .as_ref()
            .and_then(|m| m.smtp.as_ref())
            .map(|s| s.enable)
            .unwrap_or(false);

        if !is_smtp_enabled {
            // Truthful state retention when SMTP transport is unconfigured/disabled:
            // Outbox record reverts to Queued with explicit notice.
            let revert_sql = r#"
                UPDATE course_reminders
                SET status = 'Queued',
                    claimed_at = NULL,
                    reason = 'Delivery blocked: SMTP transport is disabled in current environment',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1;
            "#;
            let _ = self
                .ctx
                .db
                .execute_raw(sea_orm::Statement::from_sql_and_values(
                    self.ctx.db.get_database_backend(),
                    revert_sql,
                    vec![args.reminder_id.clone().into()],
                ))
                .await?;
            tracing::info!(
                reminder_id = %args.reminder_id,
                "SMTP transport disabled in configuration; reminder outbox reverted to Queued."
            );
            return Ok(());
        }

        // Real SMTP transport dispatch
        // Note: Between SMTP transport acceptance and database status commit, an unavoidable
        // send/ack crash window exists. Standard SMTP transport cannot provide cross-system
        // two-phase commit; exactly-once delivery across network crashes is impossible.
        // Guarantees are at-least-once with bounded retries (3) and duplicate claim prevention.
        let send_result = crate::mailers::course::CourseMailer::send_reminder(
            &self.ctx,
            &emp_email,
            &emp_name,
            &course_title,
            due_date.as_deref(),
        )
        .await;

        match send_result {
            Ok(()) => {
                let deliver_sql = r#"
                    UPDATE course_reminders
                    SET status = 'Delivered',
                        reason = 'SMTP transport accepted message for delivery',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1;
                "#;
                let _ = self
                    .ctx
                    .db
                    .execute_raw(sea_orm::Statement::from_sql_and_values(
                        self.ctx.db.get_database_backend(),
                        deliver_sql,
                        vec![args.reminder_id.clone().into()],
                    ))
                    .await?;
                tracing::info!(
                    reminder_id = %args.reminder_id,
                    recipient = %emp_email,
                    "SMTP transport accepted reminder message; status updated to Delivered."
                );
                Ok(())
            }
            Err(e) => {
                let new_retry = current_retry_count + 1;
                let is_terminal = new_retry >= 3;
                let err_msg = e.to_string();

                if is_terminal {
                    let fail_sql = r#"
                        UPDATE course_reminders
                        SET status = 'Failed',
                            retry_count = $2,
                            reason = $3,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1;
                    "#;
                    let reason_str =
                        format!("Terminal transport failure after 3 attempts: {}", err_msg);
                    let _ = self
                        .ctx
                        .db
                        .execute_raw(sea_orm::Statement::from_sql_and_values(
                            self.ctx.db.get_database_backend(),
                            fail_sql,
                            vec![
                                args.reminder_id.clone().into(),
                                new_retry.into(),
                                reason_str.into(),
                            ],
                        ))
                        .await?;
                    tracing::error!(
                        reminder_id = %args.reminder_id,
                        error = %err_msg,
                        "Reminder failed permanently after reaching 3 retries; status set to Failed."
                    );
                } else {
                    let retry_sql = r#"
                        UPDATE course_reminders
                        SET status = 'Queued',
                            claimed_at = NULL,
                            retry_count = $2,
                            reason = $3,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1;
                    "#;
                    let reason_str = format!(
                        "Retryable transport error (attempt {}): {}",
                        new_retry, err_msg
                    );
                    let _ = self
                        .ctx
                        .db
                        .execute_raw(sea_orm::Statement::from_sql_and_values(
                            self.ctx.db.get_database_backend(),
                            retry_sql,
                            vec![
                                args.reminder_id.clone().into(),
                                new_retry.into(),
                                reason_str.into(),
                            ],
                        ))
                        .await?;
                    tracing::warn!(
                        reminder_id = %args.reminder_id,
                        retry = new_retry,
                        error = %err_msg,
                        "Reminder encountered retryable transport error; returned to Queued for retry."
                    );
                }
                Ok(())
            }
        }
    }
}
