PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    external_ref_hash TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(customer_id) ON DELETE SET NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    expires_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_customer ON sessions(customer_id);

CREATE TABLE IF NOT EXISTS session_facts (
    fact_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    fact_type TEXT NOT NULL,
    value_json TEXT NOT NULL,
    confirmation_status TEXT NOT NULL CHECK (confirmation_status IN ('inferred', 'expressed', 'confirmed')),
    source_message_id TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(session_id, fact_type)
);

CREATE TABLE IF NOT EXISTS session_summaries (
    summary_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    user_goal_json TEXT NOT NULL,
    confirmed_info_json TEXT NOT NULL,
    result_json TEXT NOT NULL,
    unresolved_questions_json TEXT NOT NULL,
    knowledge_source_version TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memory_consents (
    consent_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    scope TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('granted', 'revoked')),
    granted_at TEXT NOT NULL,
    revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_consents_customer_scope ON memory_consents(customer_id, scope, status);

CREATE TABLE IF NOT EXISTS long_term_memories (
    memory_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL,
    value_json TEXT NOT NULL,
    consent_id TEXT NOT NULL REFERENCES memory_consents(consent_id),
    source_session_id TEXT REFERENCES sessions(session_id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_deletion')),
    delete_after TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(customer_id, memory_type)
);

CREATE INDEX IF NOT EXISTS idx_memories_deletion ON long_term_memories(status, delete_after);

CREATE TABLE IF NOT EXISTS recommendation_runs (
    recommendation_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    result_json TEXT NOT NULL,
    knowledge_source_version TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quote_versions (
    quote_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    quote_version TEXT NOT NULL,
    amount_json TEXT NOT NULL,
    recommendation_id TEXT REFERENCES recommendation_runs(recommendation_id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    UNIQUE(session_id, quote_version)
);

CREATE TABLE IF NOT EXISTS customer_feedback (
    feedback_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    feedback_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deletion_requests (
    request_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    scope TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
    requested_at TEXT NOT NULL,
    business_hidden_at TEXT NOT NULL,
    due_at TEXT NOT NULL,
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_deletion_due ON deletion_requests(status, due_at);

CREATE TABLE IF NOT EXISTS privacy_audit_logs (
    audit_id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_hash TEXT NOT NULL,
    details_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);
