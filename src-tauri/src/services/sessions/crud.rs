/*!
 * SOURCE OF TRUTH KEYWORDS: create_session, finalize_session, get_session,
 *   list_sessions, delete_session, delete_sessions, delete_all_sessions,
 *   NewSession, SessionResult, row_to_summary, SELECT_COLUMNS
 * WHAT:  CRUD operations on the sessions table.
 * WHY:   Keeps basic creation, retrieval, updates, and deletions separate from
 *        search indexes and lifecycle stats.
 * WHERE: Consumed by services/sessions/mod.rs.
 */

use rusqlite::{params, Row};

use crate::db::Database;
use crate::error::AppResult;
use crate::types::{DeliveryKind, SessionId, SessionOutcome, SessionSummary};

/**
 * SOURCE OF TRUTH KEYWORDS: NewSession
 * WHAT:  The columns known at the moment a recording starts.
 * WHY:   Separate from SessionSummary because most of that shape does not exist
 *        yet — modelling it as one optional-heavy struct would let a caller
 *        create a row that claims to be finished.
 * WHERE: Built by session/machine.rs on the transition into Recording.
 */
#[derive(Debug, Clone)]
pub struct NewSession {
    pub id: SessionId,
    pub started_at: i64,
    pub engine_id: String,
    pub model_id: String,
    pub app_bundle_id: Option<String>,
}

/// Writes the in-flight row. Outcome starts as `orphaned` so that a crash
/// before finalize leaves an accurate record rather than a false success.
pub fn create_session(db: &Database, session: &NewSession) -> AppResult<()> {
    db.with_connection(|conn| {
        conn.execute(
            "INSERT INTO sessions (id, started_at, outcome, engine_id, model_id, app_bundle_id, delivery)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                session.id.as_str(),
                session.started_at,
                SessionOutcome::Orphaned.as_str(),
                session.engine_id,
                session.model_id,
                session.app_bundle_id,
                DeliveryKind::None.as_str(),
            ],
        )?;
        Ok(())
    })
}

/// The columns that only exist once a session has ended.
#[derive(Debug, Clone)]
pub struct SessionResult {
    pub ended_at: i64,
    pub outcome: SessionOutcome,
    pub duration_ms: i64,
    pub language: Option<String>,
    pub raw_text: Option<String>,
    pub final_text: Option<String>,
    pub word_count: Option<i64>,
    pub delivery: DeliveryKind,
    pub error_code: Option<String>,
    pub error_message: Option<String>,
}

pub fn finalize_session(
    db: &Database,
    id: &SessionId,
    result: &SessionResult,
) -> AppResult<()> {
    db.with_connection(|conn| {
        conn.execute(
            "UPDATE sessions
                SET ended_at = ?2, outcome = ?3, duration_ms = ?4, language = ?5,
                    raw_text = ?6, final_text = ?7, word_count = ?8,
                    delivery = ?9, error_code = ?10, error_message = ?11
              WHERE id = ?1",
            params![
                id.as_str(),
                result.ended_at,
                result.outcome.as_str(),
                result.duration_ms,
                result.language,
                result.raw_text,
                result.final_text,
                result.word_count,
                result.delivery.as_str(),
                result.error_code,
                result.error_message,
            ],
        )?;
        Ok(())
    })
}

pub fn get_session(db: &Database, id: &SessionId) -> AppResult<Option<SessionSummary>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(&format!("{SELECT_COLUMNS} WHERE id = ?1"))?;
        let mut rows = stmt.query(params![id.as_str()])?;
        match rows.next()? {
            Some(row) => Ok(Some(row_to_summary(row)?)),
            None => Ok(None),
        }
    })
}

/// Newest first. Cancelled sessions do not exist, so no filter is needed for
/// them; orphans and failures DO appear, which is the point of history.
pub fn list_sessions(db: &Database, limit: i64, offset: i64) -> AppResult<Vec<SessionSummary>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(&format!(
            "{SELECT_COLUMNS} ORDER BY started_at DESC LIMIT ?1 OFFSET ?2"
        ))?;
        let rows = stmt.query_map(params![limit, offset], row_to_summary)?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

pub fn delete_session(db: &Database, id: &SessionId) -> AppResult<()> {
    db.with_connection(|conn| {
        conn.execute("DELETE FROM sessions WHERE id = ?1", params![id.as_str()])?;
        Ok(())
    })
}

pub fn delete_sessions(db: &Database, ids: &[SessionId]) -> AppResult<u64> {
    if ids.is_empty() {
        return Ok(0);
    }
    db.with_connection_mut(|conn| {
        let tx = conn.transaction()?;
        let mut total = 0u64;
        {
            let mut stmt = tx.prepare("DELETE FROM sessions WHERE id = ?1")?;
            for id in ids {
                total += stmt.execute(params![id.as_str()])? as u64;
            }
        }
        tx.commit()?;
        Ok(total)
    })
}

pub fn delete_all_sessions(db: &Database) -> AppResult<u64> {
    db.with_connection(|conn| {
        let removed = conn.execute("DELETE FROM sessions", [])?;
        Ok(removed as u64)
    })
}

// ── Row mapping ──────────────────────────────────────────────────────────

/// Column order here is the contract `row_to_summary` reads by index.
pub const SELECT_COLUMNS: &str = "SELECT id, started_at, ended_at, outcome, duration_ms, language, \
     engine_id, model_id, raw_text, final_text, word_count, app_bundle_id, delivery, error_code, \
     error_message FROM sessions";

pub fn row_to_summary(row: &Row<'_>) -> rusqlite::Result<SessionSummary> {
    let outcome: String = row.get(3)?;
    let delivery: String = row.get(12)?;

    Ok(SessionSummary {
        id: SessionId(row.get(0)?),
        started_at_ms: row.get(1)?,
        ended_at_ms: row.get(2)?,
        // An unrecognised value means the file was written by a newer build.
        // Treating it as Orphaned is the honest reading: we cannot vouch for it.
        outcome: SessionOutcome::from_stored(&outcome).unwrap_or(SessionOutcome::Orphaned),
        duration_ms: row.get(4)?,
        language: row.get(5)?,
        engine_id: row.get(6)?,
        model_id: row.get(7)?,
        raw_text: row.get(8)?,
        final_text: row.get(9)?,
        word_count: row.get(10)?,
        app_bundle_id: row.get(11)?,
        delivery: DeliveryKind::from_stored(&delivery).unwrap_or(DeliveryKind::None),
        error_code: row.get(13)?,
        error_message: row.get(14)?,
    })
}
