import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("audit-only dashboard rebuild", () => {
  it("rebuilds from a supplied append-only audit without reading Gmail rows or external machine files", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "workflow-audit-test-"));
    const generatedPath = join(outputDirectory, "generatedAuditSnapshot.ts");
    try {
      const output = execFileSync("node", ["scripts/sync-workflow-audit.mjs", "--from-audit"], {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          WORKFLOW_AUDIT_PATH: resolve(process.cwd(), "server/fixtures/audit-sample.md"),
          WORKFLOW_AUDIT_OUTPUT_PATH: generatedPath,
        },
      });
      expect(output).toContain("Synchronized 1 application records and 1 run records");
      expect(readFileSync(generatedPath, "utf8")).toContain('"fixture-message-id"');
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }
  });
});
