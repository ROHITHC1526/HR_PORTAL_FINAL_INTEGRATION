import os

path = r"c:\bright_cone by reacttt - Copy\src\models\mod.rs"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the end of DashboardStats
cutoff_idx = -1
for i, line in enumerate(lines):
    if "pub struct DashboardStats" in line:
        # find matching closing brace
        for j in range(i, len(lines)):
            if lines[j].strip() == "}":
                cutoff_idx = j + 1
                break
        break

if cutoff_idx == -1:
    raise Exception("Could not find DashboardStats closing brace")

print(f"Keeping lines up to index {cutoff_idx}")

new_app_state = '''
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransientState {
    pub wakeup_count: usize,
    pub last_wakeup_time: String,
    pub last_db_latency_ms: u64,
}

impl Default for TransientState {
    fn default() -> Self {
        Self {
            wakeup_count: 0,
            last_wakeup_time: "Never".to_string(),
            last_db_latency_ms: 0,
        }
    }
}

/// Thread-safe, database-backed application state for Brightcone HR Portal.
/// PostgreSQL is the single source of truth for all business entities.
#[derive(Clone)]
pub struct AppState {
    pub repo: Arc<DatabaseRepository>,
    pub transient: Arc<RwLock<TransientState>>,
}

pub type SharedState = Arc<AppState>;

impl AppState {
    pub fn new(repo: DatabaseRepository) -> Self {
        Self {
            repo: Arc::new(repo),
            transient: Arc::new(RwLock::new(TransientState::default())),
        }
    }

    pub fn record_wakeup_ping(&self) {
        if let Ok(mut t) = self.transient.write() {
            t.wakeup_count += 1;
            t.last_wakeup_time = "Just now".to_string();
        }
    }

    pub fn get_wakeup_info(&self) -> serde_json::Value {
        let (count, time, lat) = if let Ok(t) = self.transient.read() {
            (t.wakeup_count, t.last_wakeup_time.clone(), t.last_db_latency_ms)
        } else {
            (0, "Unknown".to_string(), 0)
        };
        serde_json::json!({
            "wakeup_count": count,
            "last_wakeup_time": time,
            "database_latency_ms": lat,
            "status": "active"
        })
    }
}
'''

content = "".join(lines[:cutoff_idx]) + "\n" + new_app_state

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated src/models/mod.rs!")
