PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS billing_events (
  id TEXT PRIMARY KEY NOT NULL,
  event_type TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  alias TEXT NOT NULL,
  recovery_hash TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' NOT NULL,
  current_period_end INTEGER,
  preferred_language TEXT DEFAULT 'en' NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_recovery_hash_idx ON users (recovery_hash);
CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_idx ON users (stripe_customer_id);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS inventories (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('step10', 'step4')),
  entry_date TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS inventories_user_type_date_idx
  ON inventories (user_id, type, entry_date);
CREATE INDEX IF NOT EXISTS inventories_user_date_idx
  ON inventories (user_id, entry_date);
