-- SOURCE OF TRUTH KEYWORDS: audit_log, schema_v3
-- WHAT:  Append-only audit log for enterprise compliance.
--        Records session lifecycle events — started, delivered, failed, wiped —
--        but never the transcript text itself.
-- WHY:   The privacy promise is "your speech never leaves the machine". That
--        needs to be auditable without exposing it. This table stores WHAT
--        happened (outcome, duration, delivery method) and WHEN, never the
--        content of what was said. It is separate from the sessions table so
--        that a full data wipe (wipe_all_data) can clear sessions without
--        destroying the compliance audit trail.
-- WHERE: Applied by db/migrations.rs when user_version < 3.

CREATE TABLE audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Unix epoch milliseconds — the same resolution as sessions.started_at.
    recorded_at INTEGER NOT NULL,
    -- 'session_started' | 'session_delivered' | 'session_failed' |
    -- 'session_orphaned' | 'data_wiped' | 'history_cleared'
    event_kind  TEXT    NOT NULL,
    -- Duration in ms. NULL for events with no associated recording.
    duration_ms INTEGER,
    -- Matches sessions.outcome when present.
    outcome     TEXT,
    -- Matches sessions.delivery when present.
    delivery    TEXT
);

CREATE INDEX idx_audit_log_recorded_at ON audit_log (recorded_at DESC);
CREATE INDEX idx_audit_log_event_kind  ON audit_log (event_kind, recorded_at DESC);
