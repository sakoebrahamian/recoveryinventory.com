CREATE TABLE IF NOT EXISTS inventory_guide_usage (
  bucket TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0)
);

CREATE INDEX IF NOT EXISTS inventory_guide_usage_expiry_idx
  ON inventory_guide_usage (expires_at);
