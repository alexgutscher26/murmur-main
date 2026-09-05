/*!
 * SOURCE OF TRUTH KEYWORDS: search_sessions, SELECT_DISTINCT_COLUMNS
 * WHAT:  Full-text search over finalized transcripts using SQLite FTS5.
 * WHY:   External-content FTS table indexed for high-performance querying
 *        over large history databases.
 * WHERE: Consumed by services/sessions/mod.rs and History search.
 */

use rusqlite::params;

use crate::db::Database;
use crate::error::AppResult;
use crate::types::SessionSummary;

use super::crud::row_to_summary;

pub const SELECT_DISTINCT_COLUMNS: &str = "SELECT DISTINCT id, started_at, ended_at, outcome, duration_ms, language, \
     engine_id, model_id, raw_text, final_text, word_count, app_bundle_id, delivery, error_code, \
     error_message FROM sessions";

/**
 * SOURCE OF TRUTH KEYWORDS: search_sessions
 * WHAT:  Full-text search over final transcripts, newest first.
 * WHY:   Goes through the FTS index rather than a LIKE scan, which stops being
 *        usable somewhere in the low thousands of rows — and this table is
 *        expected to reach tens of thousands. Uses DISTINCT and GROUP BY to
 *        prevent duplicates when tokens match across columns.
 * WHERE: The History view's search box.
 */
pub fn search_sessions(db: &Database, query: &str, limit: i64) -> AppResult<Vec<SessionSummary>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(&format!(
            "{SELECT_DISTINCT_COLUMNS}
             WHERE rowid IN (SELECT DISTINCT rowid FROM sessions_fts WHERE sessions_fts MATCH ?1)
             GROUP BY sessions.id
             ORDER BY started_at DESC
             LIMIT ?2"
        ))?;
        let rows = stmt.query_map(params![query, limit], row_to_summary)?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}
