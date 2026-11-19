export const FREE_STEP10_DAYS = 7;
export const FREE_STEP10_ENTRIES = 7;

export function freeAccountWindow(createdAt: number | undefined, now = Math.floor(Date.now() / 1000)) {
  const valid = typeof createdAt === "number" && Number.isFinite(createdAt) && createdAt > 0;
  const endsAt = valid ? createdAt + FREE_STEP10_DAYS * 86400 : null;
  return { endsAt, active: Boolean(valid && now >= createdAt && endsAt !== null && now < endsAt) };
}

export function isIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// One atomic SQLite statement enforces the date limit across simultaneous tabs.
// Existing dates may be edited during the free week without using another slot.
export const FREE_STEP10_INSERT = `INSERT INTO inventories
  (id, user_id, type, entry_date, encrypted_payload, created_at, updated_at)
  SELECT ?, ?, 'step10', ?, ?, ?, ?
  WHERE (SELECT COUNT(*) FROM inventories WHERE user_id = ? AND type = 'step10') < ${FREE_STEP10_ENTRIES}
     OR EXISTS (SELECT 1 FROM inventories WHERE user_id = ? AND type = 'step10' AND entry_date = ?)
  ON CONFLICT(user_id, type, entry_date) DO UPDATE SET
    encrypted_payload = excluded.encrypted_payload, updated_at = excluded.updated_at`;
