PRAGMA foreign_keys = ON;

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

-- Preserve every previously saved date-based Step 4 inventory as an editable workbook.
INSERT OR IGNORE INTO step4_workbooks
  (id, user_id, encrypted_payload, created_at, updated_at)
SELECT id, user_id, encrypted_payload, created_at, updated_at
FROM inventories
WHERE type = 'step4';
