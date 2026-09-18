import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    alias: text("alias").notNull(),
    recoveryHash: text("recovery_hash").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status").notNull().default("inactive"),
    currentPeriodEnd: integer("current_period_end"),
    preferredLanguage: text("preferred_language").notNull().default("en"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("users_recovery_hash_idx").on(table.recoveryHash),
    uniqueIndex("users_stripe_customer_idx").on(table.stripeCustomerId),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("sessions_user_idx").on(table.userId), index("sessions_expiry_idx").on(table.expiresAt)],
);

export const emailAccounts = sqliteTable(
  "email_accounts",
  {
    userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    verifiedAt: integer("verified_at").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("email_accounts_email_idx").on(table.email)],
);

export const emailChallenges = sqliteTable(
  "email_challenges",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    purpose: text("purpose").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    alias: text("alias"),
    preferredLanguage: text("preferred_language").notNull().default("en"),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: integer("expires_at").notNull(),
    consumedAt: integer("consumed_at"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("email_challenges_email_created_idx").on(table.email, table.createdAt),
    index("email_challenges_expiry_idx").on(table.expiresAt),
    index("email_challenges_user_idx").on(table.userId),
  ],
);

export const inventories = sqliteTable(
  "inventories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    entryDate: text("entry_date").notNull(),
    encryptedPayload: text("encrypted_payload").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("inventories_user_type_date_idx").on(table.userId, table.type, table.entryDate),
    index("inventories_user_date_idx").on(table.userId, table.entryDate),
  ],
);

export const billingEvents = sqliteTable("billing_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  createdAt: integer("created_at").notNull(),
});
