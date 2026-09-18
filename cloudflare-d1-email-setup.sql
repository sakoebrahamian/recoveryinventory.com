PRAGMA foreign_keys = ON;

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
