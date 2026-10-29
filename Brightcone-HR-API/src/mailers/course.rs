// course reminder mailer
#![allow(non_upper_case_globals)]

use loco_rs::prelude::*;
use serde::Deserialize;
use serde_json::json;

static reminder: Dir<'_> = include_dir!("src/mailers/course/reminder");

pub struct CourseMailer {}
impl Mailer for CourseMailer {}

#[derive(Deserialize)]
struct MailerSettings {
    frontend_base_url: String,
}

fn employee_learning_url(frontend_base_url: &str) -> String {
    format!(
        "{}/learn/my-learning",
        frontend_base_url.trim_end_matches('/')
    )
}

impl CourseMailer {
    pub async fn send_reminder(
        ctx: &AppContext,
        to: &str,
        name: &str,
        course_title: &str,
        due_date: Option<&str>,
    ) -> Result<()> {
        let settings: MailerSettings = ctx.config.settings()?;
        Self::mail_template_now(
            ctx,
            &reminder,
            mailer::Args {
                from: Some("learning@brightcone.ai".to_string()),
                to: to.to_string(),
                locals: json!({
                    "name": name,
                    "courseTitle": course_title,
                    "dueDate": due_date.unwrap_or("No deadline specified"),
                    "learningUrl": employee_learning_url(&settings.frontend_base_url)
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
    use loco_rs::{app::AppContext, config::Config, environment::Environment, mailer::EmailSender};
    use sea_orm::Database;
    use std::io::{BufRead, BufReader, Write};
    use std::net::TcpListener;
    use std::path::Path;
    use std::thread;

    fn development_config() -> Config {
        Config::from_folder(&Environment::Development, Path::new("config"))
            .expect("development config should parse")
    }

    #[test]
    fn reminder_template_uses_configured_employee_learning_url() {
        let config = development_config();
        let settings: MailerSettings = config.settings().expect("mailer settings should parse");
        let url = employee_learning_url(&settings.frontend_base_url);
        assert_eq!(url, "http://127.0.0.1:3000/learn/my-learning");
        assert_eq!(
            config.server.full_url(),
            format!("{}:{}", config.server.host, config.server.port)
        );
    }

    #[tokio::test]
    async fn reminder_email_is_captured_with_frontend_learning_link() {
        let listener = TcpListener::bind(("127.0.0.1", 0)).expect("bind local SMTP capture");
        let port = listener.local_addr().unwrap().port();
        let capture = thread::spawn(move || {
            let (mut stream, _) = listener.accept().expect("accept SMTP connection");
            stream
                .set_read_timeout(Some(std::time::Duration::from_secs(10)))
                .unwrap();
            let mut reader = BufReader::new(stream.try_clone().unwrap());
            stream.write_all(b"220 local-capture ESMTP\r\n").unwrap();
            let mut data = false;
            let mut captured = String::new();
            loop {
                let mut line = String::new();
                if reader.read_line(&mut line).unwrap_or(0) == 0 {
                    break;
                }
                if data {
                    if line == ".\r\n" {
                        data = false;
                        stream.write_all(b"250 captured locally\r\n").unwrap();
                    } else {
                        captured.push_str(&line);
                    }
                    continue;
                }
                let command = line.to_ascii_uppercase();
                if command.starts_with("DATA") {
                    data = true;
                    stream.write_all(b"354 send message\r\n").unwrap();
                } else if command.starts_with("QUIT") {
                    stream.write_all(b"221 closing\r\n").unwrap();
                    break;
                } else {
                    stream.write_all(b"250 local-capture\r\n").unwrap();
                }
            }
            captured
        });

        let mut config = development_config();
        let smtp = config
            .mailer
            .as_mut()
            .and_then(|mailer| mailer.smtp.as_mut())
            .expect("development SMTP config should parse");
        smtp.enable = true;
        smtp.host = "127.0.0.1".to_string();
        smtp.port = port;
        smtp.secure = false;
        smtp.auth = None;
        let sender = EmailSender::smtp(smtp).expect("local SMTP sender should initialize");
        let db = Database::connect("sqlite::memory:")
            .await
            .expect("in-memory database should connect");
        let ctx = AppContext::builder(Environment::Development, db, config)
            .mailer(sender)
            .build();

        CourseMailer::send_reminder(
            &ctx,
            "employee@example.test",
            "Employee",
            "Security basics",
            Some("2026-12-15"),
        )
        .await
        .expect("reminder should deliver to local capture only");

        let captured = capture.join().expect("SMTP capture thread should finish");
        assert!(captured.contains("http://127.0.0.1:3000/learn/my-learning"));
    }
}
