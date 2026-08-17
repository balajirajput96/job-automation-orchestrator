import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("audit-only dashboard rebuild", () => {
  it("rebuilds the generated snapshot without reading gmail_application_rows.tsv", () => {
    const output = execFileSync("node", ["scripts/sync-workflow-audit.mjs", "--from-audit"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    expect(output).toContain("Synchronized 41 application records");
  });
});
