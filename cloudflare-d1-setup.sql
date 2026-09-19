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

CREATE TABLE IF NOT EXISTS email_accounts (
  user_id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  verified_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS email_accounts_email_idx ON email_accounts (email);

CREATE TABLE IF NOT EXISTS email_challenges (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'add_email')),
  user_id TEXT,
  alias TEXT,
  preferred_language TEXT DEFAULT 'en' NOT NULL,
  attempts INTEGER DEFAULT 0 NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS email_challenges_email_created_idx
  ON email_challenges (email, created_at);
CREATE INDEX IF NOT EXISTS email_challenges_expiry_idx ON email_challenges (expires_at);
CREATE INDEX IF NOT EXISTS email_challenges_user_idx ON email_challenges (user_id);

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

CREATE TABLE IF NOT EXISTS step4_workbooks (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS step4_workbooks_user_updated_idx
  ON step4_workbooks (user_id, updated_at);
