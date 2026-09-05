/*!
 * SOURCE OF TRUTH KEYWORDS: create_session, finalize_session, get_session,
 *   list_sessions, search_sessions, delete_session, delete_all_sessions,
 *   find_orphans, mark_orphaned, purge_older_than, NewSession, SessionResult,
 *   row_to_summary, SELECT_COLUMNS, SELECT_DISTINCT_COLUMNS
 * WHAT:  Pure SQLite access to the sessions table.
 * WHY:   Pre-emptively split into modular submodules (crud, search, stats)
 *        to stay under the 400-line single-responsibility limit while
 *        presenting a unified facade to callers.
 * WHERE: Consumed by session/machine.rs, session/recovery.rs, and ipc/commands/history.rs.
 */

pub mod crud;
pub mod search;
pub mod stats;

pub use crud::*;
pub use search::*;
pub use stats::*;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;
    use crate::error::AppResult;
    use crate::types::{DeliveryKind, SessionId, SessionOutcome};
    use rusqlite::params;

    fn seed(db: &Database, id: &str, started_at: i64) -> AppResult<SessionId> {
        let session_id = SessionId(id.to_string());
        create_session(
            db,
            &NewSession {
                id: session_id.clone(),
                started_at,
                engine_id: "whisper".into(),
                model_id: "turbo".into(),
                app_bundle_id: None,
            },
        )?;
        Ok(session_id)
    }

    #[test]
    fn a_new_session_is_an_orphan_until_finalized() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let id = seed(&db, "s1", 1000)?;

        let orphans = find_orphans(&db)?;
        assert_eq!(orphans.len(), 1);
        assert_eq!(orphans[0].id, id);

        finalize_session(
            &db,
            &id,
            &SessionResult {
                ended_at: 2000,
                outcome: SessionOutcome::Delivered,
                duration_ms: 1000,
                language: Some("en".into()),
                raw_text: Some("hello there".into()),
                final_text: Some("Hello there.".into()),
                word_count: Some(2),
                delivery: DeliveryKind::Pasted,
                error_code: None,
                error_message: None,
            },
        )?;

        assert!(find_orphans(&db)?.is_empty());
        let stored = get_session(&db, &id)?.expect("session should exist");
        assert_eq!(stored.outcome, SessionOutcome::Delivered);
        assert_eq!(stored.delivery, DeliveryKind::Pasted);
        Ok(())
    }

    #[test]
    fn search_finds_a_finalized_transcript() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let id = seed(&db, "s1", 1000)?;
        finalize_session(
            &db,
            &id,
            &SessionResult {
                ended_at: 2000,
                outcome: SessionOutcome::Delivered,
                duration_ms: 1000,
                language: Some("en".into()),
                raw_text: None,
                final_text: Some("the quick brown fox".into()),
                word_count: Some(4),
                delivery: DeliveryKind::Pasted,
                error_code: None,
                error_message: None,
            },
        )?;

        assert_eq!(search_sessions(&db, "brown", 10)?.len(), 1);
        assert_eq!(search_sessions(&db, "elephant", 10)?.len(), 0);
        Ok(())
    }

    #[test]
    fn search_does_not_return_duplicate_results() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let id = seed(&db, "s1", 1000)?;
        finalize_session(
            &db,
            &id,
            &SessionResult {
                ended_at: 2000,
                outcome: SessionOutcome::Delivered,
                duration_ms: 1000,
                language: Some("en".into()),
                raw_text: Some("apple orange".into()),
                final_text: Some("apple orange banana".into()),
                word_count: Some(3),
                delivery: DeliveryKind::Pasted,
                error_code: None,
                error_message: None,
            },
        )?;

        let results = search_sessions(&db, "apple", 10)?;
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, id);
        Ok(())
    }

    #[test]
    fn deleting_a_session_takes_its_metrics_with_it() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let id = seed(&db, "s1", 1000)?;

        db.with_connection(|conn| {
            conn.execute(
                "INSERT INTO session_metrics (session_id, stage, duration_ms, recorded_at)
                 VALUES (?1, 'tail_decode', 120.0, 1500)",
                params![id.as_str()],
            )?;
            Ok(())
        })?;

        delete_session(&db, &id)?;

        db.with_connection(|conn| {
            let metrics_count: i64 = conn.query_row("SELECT count(*) FROM session_metrics", [], |r| r.get(0))?;
            let sessions_count: i64 = conn.query_row("SELECT count(*) FROM sessions", [], |r| r.get(0))?;
            assert_eq!(metrics_count, 0);
            assert_eq!(sessions_count, 0);
            Ok(())
        })
    }

    #[test]
    fn purge_removes_only_rows_older_than_the_cutoff() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        seed(&db, "old", 1_000)?;
        seed(&db, "new", 9_000)?;

        assert_eq!(purge_older_than(&db, 5_000)?, 1);
        assert_eq!(count_sessions(&db)?, 1);
        Ok(())
    }

    #[test]
    fn batch_delete_removes_specified_sessions() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let s1 = seed(&db, "s1", 1_000)?;
        let s2 = seed(&db, "s2", 2_000)?;
        let s3 = seed(&db, "s3", 3_000)?;

        let deleted = delete_sessions(&db, &[s1, s3])?;
        assert_eq!(deleted, 2);
        assert_eq!(count_sessions(&db)?, 1);
        assert!(get_session(&db, &s2)?.is_some());
        Ok(())
    }
}
