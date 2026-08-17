import { describe, expect, it } from "vitest";
import { applicationRecords, auditSource, runRecords } from "./generatedAuditSnapshot";

describe("generated audit snapshot", () => {
  it("preserves the append-only job-search audit as its declared source", () => {
    expect(auditSource).toBe("/home/ubuntu/job_search_findings.md");
    expect(applicationRecords).toHaveLength(39);
    expect(applicationRecords.some(record => record.recipient.includes("aman.kumar@elysiumpharma.com"))).toBe(true);
  });

  it("includes audited scheduled-run history with real source URLs", () => {
    expect(runRecords.length).toBeGreaterThan(0);
    expect(runRecords.every(run => run.sources.length > 0)).toBe(true);
    expect(runRecords.some(run => run.reviewed > 0)).toBe(true);
  });
});
