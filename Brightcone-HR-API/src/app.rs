use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Hooks, Initializer},
    bgworker::{BackgroundWorker, Queue},
    boot::{create_app, BootResult, StartMode},
    config::Config,
    controller::AppRoutes,
    environment::Environment,
    task::Tasks,
    Result,
};

#[allow(unused_imports)]
use crate::{controllers, initializers, tasks, workers::downloader::DownloadWorker};

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(
        mode: StartMode,
        environment: &Environment,
        config: Config,
    ) -> Result<BootResult> {
        create_app::<Self, crate::database::empty_migrator::EmptyMigrator>(
            mode,
            environment,
            config,
        )
        .await
    }

    async fn initializers(_ctx: &AppContext) -> Result<Vec<Box<dyn Initializer>>> {
        let state_init = initializers::state::StateInitializer::init().await?;
        Ok(vec![
            Box::new(initializers::view_engine::ViewEngineInitializer),
            Box::new(state_init),
            Box::new(initializers::schema_sync::SchemaSyncInitializer),
        ])
    }

    fn routes(ctx: &AppContext) -> AppRoutes {
        let routes = AppRoutes::with_default_routes() // controller routes below
            .add_route(controllers::page::routes())
            .add_route(controllers::home::routes())
            .add_route(controllers::api::routes())
            .add_route(controllers::auth::routes(ctx))
            .add_route(controllers::auth::v1_routes())
            .add_route(controllers::learn::routes())
            .add_route(controllers::learn::api_routes())
            .add_route(controllers::learn::direct_routes())
            .add_route(controllers::performance::routes())
            .add_route(controllers::performance::direct_routes())
            .add_route(controllers::me::routes())
            .add_route(controllers::admin_users::routes())
            .add_route(controllers::audit_log::routes())
            .add_route(controllers::people::routes())
            .add_route(controllers::people_mutations::routes())
            .add_route(controllers::people_references::routes())
            .add_route(controllers::people_reference_mutations::routes())
            .add_route(controllers::people_csv::routes())
            .add_route(controllers::people_security::routes())
            .add_route(controllers::records::routes())
            .add_route(controllers::record_types::routes())
            .add_route(controllers::exports::routes())
            .add_route(controllers::files::routes())
            .add_route(controllers::notifications::routes())
            .add_route(controllers::rules::routes())
            .add_route(controllers::signature_templates::routes())
            .add_route(controllers::shifts::routes())
            .add_route(controllers::holidays::routes())
            .add_route(controllers::leave_types::routes())
            .add_route(controllers::leave_quotas::routes())
            .add_route(controllers::roster::routes())
            .add_route(controllers::attendance::routes())
            .add_route(controllers::leave_calc::routes())
            .add_route(controllers::leave_requests::routes())
            .add_route(controllers::wfh::routes())
            .add_route(controllers::comp_off::routes())
            .add_route(controllers::swaps::routes())
            .add_route(controllers::signature_templates::v1_routes());

        if ctx.environment == Environment::Production {
            routes
        } else {
            routes.add_route(controllers::docs::routes())
        }
    }

    async fn after_routes(router: axum::Router, _ctx: &AppContext) -> Result<axum::Router> {
        let router = router.merge(crate::modules::domain_router());
        Ok(router)
    }

    async fn connect_workers(ctx: &AppContext, queue: &Queue) -> Result<()> {
        queue.register(DownloadWorker::build(ctx)).await?;
        queue
            .register(crate::workers::course_reminder::CourseReminderWorker::build(ctx))
            .await?;
        queue
            .register(crate::workers::rule_dispatch::RuleDispatchWorker::build(
                ctx,
            ))
            .await?;
        queue
            .register(crate::workers::cleanup::TokenCleanupWorker::build(ctx))
            .await?;
        Ok(())
    }

    #[allow(unused_variables)]
    fn register_tasks(tasks: &mut Tasks) {
        // tasks-inject (do not remove)
        tasks.register(tasks::seed_demo::SeedDemo);
        tasks.register(tasks::user_create::UserCreate);
    }

    async fn truncate(_ctx: &AppContext) -> Result<()> {
        Ok(())
    }

    async fn seed(_ctx: &AppContext, _base: &std::path::Path) -> Result<()> {
        Ok(())
    }
}
