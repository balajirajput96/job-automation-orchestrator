import type { Request, Response } from "express";
import { applicationRecords, auditSource, latestRun, permanentExclusion, runRecords } from "./workflowData";
import { countEngineeringMaintenanceRuns, recordEngineeringMaintenanceRun } from "./db";
import { sdk } from "./_core/sdk";

export const MAX_ENGINEERING_MAINTENANCE_CYCLES = 2400;

export function engineeringScheduledHour(now = new Date()) {
  return `${now.toISOString().slice(0, 13)}:00Z`;
}

export function buildEngineeringMaintenanceSnapshot() {
  const latestAudit = runRecords[0];
  const checks = {
    auditSource: auditSource === "/home/ubuntu/job_search_findings.md",
    hasAuditedApplications: applicationRecords.length > 0,
    hasAuditedRuns: runRecords.length > 0,
    hasLatestRun: Boolean(latestAudit?.id && latestRun.time !== "Recorded time unavailable"),
    exclusionPreserved: permanentExclusion === "aman.kumar@elysiumpharma.com",
  };
  const validationStatus = Object.values(checks).every(Boolean) ? "passed" : "failed";
  return {
    checks,
    validationStatus,
    detail: `Audit source ${auditSource}; ${applicationRecords.length} applications; ${runRecords.length} runs; latest ${latestAudit?.id ?? "none"}.`,
  } as const;
}

export async function runEngineeringMaintenance(req: Request, res: Response) {
  const now = new Date();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });

    const executionCount = await countEngineeringMaintenanceRuns(user.taskUid);
    if (executionCount >= MAX_ENGINEERING_MAINTENANCE_CYCLES) {
      return res.json({ ok: true, skipped: "maximum-execution-cycles-reached", maximumExecutionCycles: MAX_ENGINEERING_MAINTENANCE_CYCLES });
    }

    const snapshot = buildEngineeringMaintenanceSnapshot();
    const executionNumber = executionCount + 1;
    await recordEngineeringMaintenanceRun({
      heartbeatTaskUid: user.taskUid,
      scheduledHour: engineeringScheduledHour(now),
      executionNumber,
      action: "hourly-deterministic-maintenance",
      result: snapshot.validationStatus === "passed" ? "completed" : "degraded",
      validationStatus: snapshot.validationStatus,
      failureCategory: snapshot.validationStatus === "passed" ? null : "audit-snapshot",
      detail: snapshot.detail,
      remainingBlocker: snapshot.validationStatus === "passed" ? null : "Audit snapshot invariant failed; inspect the latest generated audit data.",
      nextRecommendedAction: snapshot.validationStatus === "passed"
        ? "Continue with the next hourly deterministic maintenance cycle; retain the separate twice-daily job-search schedule."
        : "Inspect and repair the generated audit snapshot before the next cycle.",
    });
    return res.json({ ok: true, executionNumber, scheduledHour: engineeringScheduledHour(now), ...snapshot });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: detail, timestamp: now.toISOString() });
  }
}
