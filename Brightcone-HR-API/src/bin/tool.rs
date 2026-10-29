use brightcone_hr_portal::{app::App, database::empty_migrator::EmptyMigrator};
use loco_rs::cli;

#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    cli::main::<App, EmptyMigrator>().await
}
