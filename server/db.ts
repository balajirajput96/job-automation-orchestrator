import { count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { engineeringMaintenanceRuns, InsertUser, users, workflowControlEvents, workflowSettings } from "../drizzle/schema";
import { ENV } from "./_core/env";

let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) database = drizzle(process.env.DATABASE_URL);
  return database;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({ ...user, lastSignedIn: user.lastSignedIn ?? new Date() }).onDuplicateKeyUpdate({
    set: { name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"), lastSignedIn: new Date() },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getWorkflowSetting(ownerOpenId: string) {
  const db = await getDb();
  if (!db) return { isEnabled: true, heartbeatTaskUid: null, persisted: false };
  const setting = (await db.select().from(workflowSettings).where(eq(workflowSettings.ownerOpenId, ownerOpenId)).limit(1))[0];
  return setting ? { isEnabled: setting.isEnabled, heartbeatTaskUid: setting.heartbeatTaskUid, persisted: true } : { isEnabled: true, heartbeatTaskUid: null, persisted: false };
}

export async function getWorkflowSettingByTaskUid(heartbeatTaskUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(workflowSettings).where(eq(workflowSettings.heartbeatTaskUid, heartbeatTaskUid)).limit(1))[0];
}

export async function saveWorkflowSetting(ownerOpenId: string, isEnabled: boolean, heartbeatTaskUid: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Dashboard settings database is unavailable.");
  await db.insert(workflowSettings).values({ ownerOpenId, isEnabled, heartbeatTaskUid }).onDuplicateKeyUpdate({ set: { isEnabled, heartbeatTaskUid, updatedAt: new Date() } });
  return { isEnabled, heartbeatTaskUid };
}

export async function appendWorkflowControlEvent(ownerOpenId: string, action: string, outcome: string, detail: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(workflowControlEvents).values({ ownerOpenId, action, outcome, detail });
}

export async function listWorkflowControlEvents(ownerOpenId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workflowControlEvents).where(eq(workflowControlEvents.ownerOpenId, ownerOpenId)).orderBy(desc(workflowControlEvents.createdAt)).limit(8);
}

export async function countEngineeringMaintenanceRuns(heartbeatTaskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Engineering maintenance database is unavailable.");
  const result = await db.select({ value: count() }).from(engineeringMaintenanceRuns).where(eq(engineeringMaintenanceRuns.heartbeatTaskUid, heartbeatTaskUid));
  return result[0]?.value ?? 0;
}

export async function recordEngineeringMaintenanceRun(input: {
  heartbeatTaskUid: string;
  scheduledHour: string;
  executionNumber: number;
  action: string;
  result: string;
  validationStatus: string;
  failureCategory?: string | null;
  recoveryAttempt?: number;
  detail: string;
  remainingBlocker?: string | null;
  nextRecommendedAction: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Engineering maintenance database is unavailable.");
  await db.insert(engineeringMaintenanceRuns).values({
    ...input,
    failureCategory: input.failureCategory ?? null,
    recoveryAttempt: input.recoveryAttempt ?? 0,
    remainingBlocker: input.remainingBlocker ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      result: input.result,
      validationStatus: input.validationStatus,
      failureCategory: input.failureCategory ?? null,
      recoveryAttempt: input.recoveryAttempt ?? 0,
      detail: input.detail,
      remainingBlocker: input.remainingBlocker ?? null,
      nextRecommendedAction: input.nextRecommendedAction,
    },
  });
}
