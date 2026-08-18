import { describe, expect, it } from "vitest";
import { applicationRecords, auditSource, runRecords } from "./generatedAuditSnapshot";

describe("generated audit snapshot", () => {
  it("preserves the append-only job-search audit as its declared source", () => {
    expect(auditSource).toBe("/home/ubuntu/job_search_findings.md");
    expect(applicationRecords).toHaveLength(44);
    expect(applicationRecords[0]).toMatchObject({
      employer: "Covalent Laboratories",
      recipient: "ta@covalentlab.com",
      historicalExclusion: false,
    });
    expect(applicationRecords.some(record => record.recipient.includes("aman.kumar@elysiumpharma.com"))).toBe(true);
  });

  it("includes audited scheduled-run history with real source URLs", () => {
    expect(runRecords).toHaveLength(13);
    expect(runRecords[0]).toMatchObject({ id: "audit-run-13", reviewed: 7, sent: 1 });
    expect(runRecords.every(run => run.sources.length > 0)).toBe(true);
    expect(runRecords.map(run => run.reviewed)).toEqual([7, 9, 2, 1, 7, 10, 4, 4, 4, 4, 5, 4, 7]);
    expect(runRecords.map(run => run.sent)).toEqual([1, 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1]);
  });
});
