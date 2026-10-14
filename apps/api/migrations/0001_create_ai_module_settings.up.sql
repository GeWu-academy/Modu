CREATE TABLE IF NOT EXISTS ai_module_settings (
    tenant_id  TEXT PRIMARY KEY,
    remote_url TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
