-- SOURCE OF TRUTH KEYWORDS: dictionary_changelog
-- WHAT:  Tracks additions, edits, and deletions in the user dictionary.
-- WHY:   Allows users to inspect their dictionary history with timestamps and
--        safely undo accidental modifications or erroneous bulk imports.
-- WHERE: Stored by services/dictionary.rs and exposed via IPC.

CREATE TABLE dictionary_changelog (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id         INTEGER,
    action           TEXT    NOT NULL, -- 'added' | 'updated' | 'deleted'
    pattern          TEXT    NOT NULL,
    replacement      TEXT    NOT NULL,
    match_kind       TEXT    NOT NULL,
    prev_replacement TEXT,
    prev_match_kind  TEXT,
    timestamp        INTEGER NOT NULL
);

CREATE INDEX idx_dictionary_changelog_timestamp ON dictionary_changelog (timestamp DESC);
