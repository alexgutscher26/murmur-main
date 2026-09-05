/*!
 * SOURCE OF TRUTH KEYWORDS: find_orphans, mark_orphaned, purge_older_than, count_sessions
 * WHAT:  Lifecycle maintenance, retention purging, and orphan recovery.
 * WHY:   Keeps crash recovery and maintenance separate from everyday CRUD.
 * WHERE: Consumed by services/sessions/mod.rs.
 */

use rusqlite::params;

use crate::db::Database;
use crate::error::AppResult;
use crate::types::{SessionId, SessionOutcome, SessionSummary};

use super::crud::{row_to_summary, SELECT_COLUMNS};

/// Sessions that were never finalized — the process died mid-recording.
pub fn find_orphans(db: &Database) -> AppResult<Vec<SessionSummary>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(&format!(
            "{SELECT_COLUMNS} WHERE ended_at IS NULL ORDER BY started_at DESC"
        ))?;
        let rows = stmt.query_map([], row_to_summary)?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

/// Closes out an orphan that cannot be recovered, so it stops being reported.
pub fn mark_orphaned(db: &Database, id: &SessionId, ended_at: i64) -> AppResult<()> {
    db.with_connection(|conn| {
        conn.execute(
            "UPDATE sessions SET ended_at = ?2, outcome = ?3 WHERE id = ?1 AND ended_at IS NULL",
            params![id.as_str(), ended_at, SessionOutcome::Orphaned.as_str()],
        )?;
        Ok(())
    })
}

/// Retention policy. Takes an absolute cutoff — computing it from a retention
/// setting is a business rule and belongs to the caller.
pub fn purge_older_than(db: &Database, cutoff_ms: i64) -> AppResult<u64> {
    db.with_connection(|conn| {
        let removed = conn.execute(
            "DELETE FROM sessions WHERE started_at < ?1",
            params![cutoff_ms],
        )?;
        Ok(removed as u64)
    })
}

pub fn count_sessions(db: &Database) -> AppResult<i64> {
    db.with_connection(|conn| {
        let count: i64 = conn.query_row("SELECT count(*) FROM sessions", [], |row| row.get(0))?;
        Ok(count)
    })
}
