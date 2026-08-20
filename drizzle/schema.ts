import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const workflowSettings = mysqlTable("workflow_settings", {
  id: int("id").autoincrement().primaryKey(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull().unique(),
  isEnabled: boolean("isEnabled").notNull().default(true),
  heartbeatTaskUid: varchar("heartbeatTaskUid", { length: 65 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workflowControlEvents = mysqlTable("workflow_control_events", {
  id: int("id").autoincrement().primaryKey(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  outcome: varchar("outcome", { length: 64 }).notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const engineeringMaintenanceRuns = mysqlTable("engineering_maintenance_runs", {
  id: int("id").autoincrement().primaryKey(),
  heartbeatTaskUid: varchar("heartbeatTaskUid", { length: 65 }).notNull(),
  scheduledHour: varchar("scheduledHour", { length: 32 }).notNull(),
  executionNumber: int("executionNumber").notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  result: varchar("result", { length: 32 }).notNull(),
  validationStatus: varchar("validationStatus", { length: 32 }).notNull(),
  failureCategory: varchar("failureCategory", { length: 64 }),
  recoveryAttempt: int("recoveryAttempt").notNull().default(0),
  detail: text("detail").notNull(),
  remainingBlocker: text("remainingBlocker"),
  nextRecommendedAction: text("nextRecommendedAction").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  maintenanceHourUnique: uniqueIndex("engineering_maintenance_hour_unique").on(table.heartbeatTaskUid, table.scheduledHour),
  maintenanceTaskCreatedIndex: index("engineering_maintenance_task_created_idx").on(table.heartbeatTaskUid, table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WorkflowSetting = typeof workflowSettings.$inferSelect;
