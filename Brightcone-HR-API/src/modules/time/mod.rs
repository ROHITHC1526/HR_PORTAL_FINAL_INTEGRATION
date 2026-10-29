pub mod attendance;
pub mod comp_off;
pub mod corrections;
pub mod holidays;
pub mod leave_calc;
pub mod leave_quotas;
pub mod leave_requests;
pub mod leave_types;
pub mod models;
pub mod roster;
pub mod shifts;
pub mod swaps;
pub mod wfh;

use sqlx::PgPool;

#[allow(unused_imports)]
pub use attendance::*;
#[allow(unused_imports)]
pub use comp_off::*;
#[allow(unused_imports)]
pub use corrections::*;
#[allow(unused_imports)]
pub use holidays::*;
#[allow(unused_imports)]
pub use leave_calc::*;
#[allow(unused_imports)]
pub use leave_quotas::*;
#[allow(unused_imports)]
pub use leave_requests::*;
#[allow(unused_imports)]
pub use leave_types::*;
#[allow(unused_imports)]
pub use models::*;
#[allow(unused_imports)]
pub use roster::*;
#[allow(unused_imports)]
pub use shifts::*;
#[allow(unused_imports)]
pub use swaps::*;
#[allow(unused_imports)]
pub use wfh::*;

pub type SharedTimeState = PgPool;

// =========================================================================
// Database Seed Helper
// =========================================================================

pub async fn seed_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    crate::db::seed::seed_if_empty(pool).await
}
