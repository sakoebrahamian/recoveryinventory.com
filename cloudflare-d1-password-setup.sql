PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS password_accounts (
  user_id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  username_display TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0 NOT NULL,
  last_failed_at INTEGER,
  locked_until INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS password_accounts_username_idx
  ON password_accounts (username);
