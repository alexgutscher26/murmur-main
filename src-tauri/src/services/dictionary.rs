/*!
 * SOURCE OF TRUTH KEYWORDS: list_entries, enabled_entries, create_entry,
 *   update_entry, delete_entry, touch_entry, recent_terms
 * WHAT:  Pure SQLite access to the dictionary table.
 * WHY:   `recent_terms` exists because the engine's vocabulary prompt has a
 *        hard token budget. A prompt that overflows is silently truncated by
 *        the engine, which quietly drops whichever terms happened to be last —
 *        so we choose deliberately, most-recently-used first, rather than
 *        letting the cut fall where it may.
 * WHERE: Called by ipc/commands/dictionary.rs and by pipeline/worker.rs when
 *        building a TranscribeRequest.
 */

use rusqlite::{params, Row};

use crate::db::Database;
use crate::error::AppResult;
use crate::types::{DictionaryChangeLogEntry, DictionaryEntry, DictionaryId, MatchKind};

pub fn list_entries(db: &Database) -> AppResult<Vec<DictionaryEntry>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(&format!("{SELECT_COLUMNS} ORDER BY pattern COLLATE NOCASE"))?;
        let rows = stmt.query_map([], row_to_entry)?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

pub fn enabled_entries(db: &Database) -> AppResult<Vec<DictionaryEntry>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(&format!("{SELECT_COLUMNS} WHERE enabled = 1"))?;
        let rows = stmt.query_map([], row_to_entry)?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

/// Replacement terms, most recently used first, for the engine prompt.
pub fn recent_terms(db: &Database, limit: i64) -> AppResult<Vec<String>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(
            "SELECT replacement FROM dictionary
              WHERE enabled = 1
              ORDER BY used_at DESC NULLS LAST, id DESC
              LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit], |row| row.get::<_, String>(0))?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

pub fn create_entry(
    db: &Database,
    pattern: &str,
    replacement: &str,
    match_kind: MatchKind,
    created_at: i64,
) -> AppResult<DictionaryId> {
    db.with_connection(|conn| {
        // Check if an entry with (pattern, match_kind) already existed so we can log whether it was added or updated.
        let existing: Option<(i64, String, String)> = conn
            .query_row(
                "SELECT id, replacement, match_kind FROM dictionary WHERE pattern = ?1 AND match_kind = ?2",
                params![pattern, match_kind.as_str()],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .ok();

        conn.execute(
            "INSERT INTO dictionary (pattern, replacement, match_kind, enabled, created_at)
             VALUES (?1, ?2, ?3, 1, ?4)
             ON CONFLICT (pattern, match_kind)
             DO UPDATE SET replacement = excluded.replacement, enabled = 1",
            params![pattern, replacement, match_kind.as_str(), created_at],
        )?;
        let id: i64 = conn.query_row(
            "SELECT id FROM dictionary WHERE pattern = ?1 AND match_kind = ?2",
            params![pattern, match_kind.as_str()],
            |row| row.get(0),
        )?;

        // Record to changelog
        if let Some((_, old_rep, old_kind)) = existing {
            conn.execute(
                "INSERT INTO dictionary_changelog (entry_id, action, pattern, replacement, match_kind, prev_replacement, prev_match_kind, timestamp)
                 VALUES (?1, 'updated', ?2, ?3, ?4, ?5, ?6, ?7)",
                params![id, pattern, replacement, match_kind.as_str(), old_rep, old_kind, created_at],
            )?;
        } else {
            conn.execute(
                "INSERT INTO dictionary_changelog (entry_id, action, pattern, replacement, match_kind, prev_replacement, prev_match_kind, timestamp)
                 VALUES (?1, 'added', ?2, ?3, ?4, NULL, NULL, ?5)",
                params![id, pattern, replacement, match_kind.as_str(), created_at],
            )?;
        }

        Ok(DictionaryId(id))
    })
}

pub fn update_entry(
    db: &Database,
    id: &DictionaryId,
    replacement: &str,
    match_kind: MatchKind,
    enabled: bool,
) -> AppResult<()> {
    db.with_connection(|conn| {
        let existing: Option<(String, String, String)> = conn
            .query_row(
                "SELECT pattern, replacement, match_kind FROM dictionary WHERE id = ?1",
                params![id.0],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .ok();

        conn.execute(
            "UPDATE dictionary SET replacement = ?2, match_kind = ?3, enabled = ?4 WHERE id = ?1",
            params![id.0, replacement, match_kind.as_str(), enabled],
        )?;

        if let Some((pattern, old_rep, old_kind)) = existing {
            conn.execute(
                "INSERT INTO dictionary_changelog (entry_id, action, pattern, replacement, match_kind, prev_replacement, prev_match_kind, timestamp)
                 VALUES (?1, 'updated', ?2, ?3, ?4, ?5, ?6, ?7)",
                params![id.0, pattern, replacement, match_kind.as_str(), old_rep, old_kind, crate::telemetry::now_ms()],
            )?;
        }

        Ok(())
    })
}

pub fn delete_entry(db: &Database, id: &DictionaryId) -> AppResult<()> {
    db.with_connection(|conn| {
        let existing: Option<(String, String, String)> = conn
            .query_row(
                "SELECT pattern, replacement, match_kind FROM dictionary WHERE id = ?1",
                params![id.0],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .ok();

        conn.execute("DELETE FROM dictionary WHERE id = ?1", params![id.0])?;

        if let Some((pattern, old_rep, old_kind)) = existing {
            conn.execute(
                "INSERT INTO dictionary_changelog (entry_id, action, pattern, replacement, match_kind, prev_replacement, prev_match_kind, timestamp)
                 VALUES (?1, 'deleted', ?2, ?3, ?4, NULL, NULL, ?5)",
                params![id.0, pattern, old_rep, old_kind, crate::telemetry::now_ms()],
            )?;
        }

        Ok(())
    })
}

pub fn list_changelog(
    db: &Database,
    limit: i64,
) -> AppResult<Vec<DictionaryChangeLogEntry>> {
    db.with_connection(|conn| {
        let mut stmt = conn.prepare(
            "SELECT id, entry_id, action, pattern, replacement, match_kind, prev_replacement, prev_match_kind, timestamp
             FROM dictionary_changelog
             ORDER BY timestamp DESC, id DESC
             LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit], row_to_changelog_entry)?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

pub fn undo_change(db: &Database, changelog_id: i64) -> AppResult<()> {
    db.with_connection(|conn| {
        let entry: Option<DictionaryChangeLogEntry> = conn
            .query_row(
                "SELECT id, entry_id, action, pattern, replacement, match_kind, prev_replacement, prev_match_kind, timestamp
                 FROM dictionary_changelog WHERE id = ?1",
                params![changelog_id],
                row_to_changelog_entry,
            )
            .ok();

        let Some(change) = entry else {
            return Ok(());
        };

        match change.action.as_str() {
            "added" => {
                // To undo an add: delete the entry
                conn.execute(
                    "DELETE FROM dictionary WHERE pattern = ?1 AND match_kind = ?2",
                    params![change.pattern, change.match_kind.as_str()],
                )?;
            }
            "deleted" => {
                // To undo a delete: re-create the entry
                conn.execute(
                    "INSERT INTO dictionary (pattern, replacement, match_kind, enabled, created_at)
                     VALUES (?1, ?2, ?3, 1, ?4)
                     ON CONFLICT (pattern, match_kind)
                     DO UPDATE SET replacement = excluded.replacement, enabled = 1",
                    params![
                        change.pattern,
                        change.replacement,
                        change.match_kind.as_str(),
                        crate::telemetry::now_ms()
                    ],
                )?;
            }
            "updated" => {
                // To undo an update: revert to previous replacement and match_kind
                let prev_rep = change.prev_replacement.as_deref().unwrap_or(&change.replacement);
                let prev_kind = change
                    .prev_match_kind
                    .map(|k| k.as_str())
                    .unwrap_or_else(|| change.match_kind.as_str());

                conn.execute(
                    "UPDATE dictionary SET replacement = ?1, match_kind = ?2 WHERE pattern = ?3",
                    params![prev_rep, prev_kind, change.pattern],
                )?;
            }
            _ => {}
        }

        // Remove the undone changelog record
        conn.execute(
            "DELETE FROM dictionary_changelog WHERE id = ?1",
            params![changelog_id],
        )?;

        Ok(())
    })
}

pub fn clear_changelog(db: &Database) -> AppResult<()> {
    db.with_connection(|conn| {
        conn.execute("DELETE FROM dictionary_changelog", [])?;
        Ok(())
    })
}

/// Marks a term as used, so it survives prompt truncation next time.
pub fn touch_entries(db: &Database, patterns: &[String], used_at: i64) -> AppResult<()> {
    if patterns.is_empty() {
        return Ok(());
    }
    db.with_connection_mut(|conn| {
        let tx = conn.transaction()?;
        {
            let mut stmt =
                tx.prepare("UPDATE dictionary SET used_at = ?2 WHERE pattern = ?1")?;
            for pattern in patterns {
                stmt.execute(params![pattern, used_at])?;
            }
        }
        tx.commit()?;
        Ok(())
    })
}

const SELECT_COLUMNS: &str =
    "SELECT id, pattern, replacement, match_kind, enabled, used_at FROM dictionary";

fn row_to_entry(row: &Row<'_>) -> rusqlite::Result<DictionaryEntry> {
    let match_kind: String = row.get(3)?;
    Ok(DictionaryEntry {
        id: DictionaryId(row.get(0)?),
        pattern: row.get(1)?,
        replacement: row.get(2)?,
        // An unknown kind falls back to the safe one rather than the powerful
        // one: Substring can corrupt unrelated words, Word cannot.
        match_kind: MatchKind::from_stored(&match_kind).unwrap_or(MatchKind::Word),
        enabled: row.get(4)?,
        used_at: row.get(5)?,
    })
}

fn row_to_changelog_entry(row: &Row<'_>) -> rusqlite::Result<DictionaryChangeLogEntry> {
    let match_kind_raw: String = row.get(5)?;
    let prev_match_kind_raw: Option<String> = row.get(7)?;
    Ok(DictionaryChangeLogEntry {
        id: DictionaryId(row.get(0)?),
        entry_id: row.get(1)?,
        action: row.get(2)?,
        pattern: row.get(3)?,
        replacement: row.get(4)?,
        match_kind: MatchKind::from_stored(&match_kind_raw).unwrap_or(MatchKind::Word),
        prev_replacement: row.get(6)?,
        prev_match_kind: prev_match_kind_raw.and_then(|s| MatchKind::from_stored(&s)),
        timestamp: row.get(8)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creating_the_same_pattern_twice_updates_it() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        create_entry(&db, "clod code", "Claude Code", MatchKind::Word, 1)?;
        create_entry(&db, "clod code", "Claude Code!", MatchKind::Word, 2)?;

        let entries = list_entries(&db)?;
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].replacement, "Claude Code!");
        Ok(())
    }

    #[test]
    fn recent_terms_prefer_recently_used_entries() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        create_entry(&db, "alpha", "Alpha", MatchKind::Word, 1)?;
        create_entry(&db, "beta", "Beta", MatchKind::Word, 2)?;
        touch_entries(&db, &["beta".to_string()], 500)?;

        let terms = recent_terms(&db, 10)?;
        assert_eq!(terms.first().map(String::as_str), Some("Beta"));
        Ok(())
    }

    #[test]
    fn disabled_entries_are_excluded_from_the_active_set() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let id = create_entry(&db, "alpha", "Alpha", MatchKind::Word, 1)?;
        update_entry(&db, &id, "Alpha", MatchKind::Word, false)?;

        assert_eq!(list_entries(&db)?.len(), 1);
        assert_eq!(enabled_entries(&db)?.len(), 0);
        assert_eq!(recent_terms(&db, 10)?.len(), 0);
        Ok(())
    }

    #[test]
    fn changelog_tracks_add_update_delete_and_supports_undo() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let id = create_entry(&db, "test pattern", "Test Pattern", MatchKind::Word, 100)?;

        let history = list_changelog(&db, 10)?;
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].action, "added");
        assert_eq!(history[0].pattern, "test pattern");

        update_entry(&db, &id, "Updated Pattern", MatchKind::Word, true)?;
        let history = list_changelog(&db, 10)?;
        assert_eq!(history.len(), 2);
        assert_eq!(history[0].action, "updated");
        assert_eq!(history[0].replacement, "Updated Pattern");
        assert_eq!(history[0].prev_replacement.as_deref(), Some("Test Pattern"));

        // Undo the update
        undo_change(&db, history[0].id.0)?;
        let entries = list_entries(&db)?;
        assert_eq!(entries[0].replacement, "Test Pattern");

        // Delete entry
        delete_entry(&db, &id)?;
        let history = list_changelog(&db, 10)?;
        assert_eq!(history[0].action, "deleted");
        assert_eq!(list_entries(&db)?.len(), 0);

        // Undo delete
        undo_change(&db, history[0].id.0)?;
        assert_eq!(list_entries(&db)?.len(), 1);
        assert_eq!(list_entries(&db)?[0].replacement, "Test Pattern");

        // Undo add
        let history = list_changelog(&db, 10)?;
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].action, "added");
        undo_change(&db, history[0].id.0)?;
        assert_eq!(list_entries(&db)?.len(), 0);
        assert_eq!(list_changelog(&db, 10)?.len(), 0);

        Ok(())
    }
}
