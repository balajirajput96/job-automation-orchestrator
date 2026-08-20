import { describe, expect, it } from "vitest";
import { buildEngineeringMaintenanceSnapshot, engineeringScheduledHour, MAX_ENGINEERING_MAINTENANCE_CYCLES } from "./engineeringMaintenance";

describe("hourly engineering maintenance", () => {
  it("produces a deterministic hour key and validates the audit invariants", () => {
    expect(engineeringScheduledHour(new Date("2026-08-20T11:59:59.000Z"))).toBe("2026-08-20T11:00Z");
    expect(MAX_ENGINEERING_MAINTENANCE_CYCLES).toBe(2400);
    expect(buildEngineeringMaintenanceSnapshot()).toMatchObject({
      validationStatus: "passed",
      checks: {
        auditSource: true,
        hasAuditedApplications: true,
        hasAuditedRuns: true,
        hasLatestRun: true,
        exclusionPreserved: true,
      },
    });
  });
});
