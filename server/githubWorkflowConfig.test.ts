import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = (name: string) =>
  readFileSync(resolve(process.cwd(), ".github", "workflows", name), "utf8");

describe("GitHub workflow runner configuration", () => {
  it("uses a fixed GitHub-hosted Ubuntu image for the runner-recovery diagnostic", () => {
    expect(workflow("verify.yml")).toContain("runs-on: ubuntu-22.04");
    expect(workflow("hourly-maintenance.yml")).toContain("runs-on: ubuntu-22.04");
  });

  it("preserves the hourly schedule and read-only workflow permissions", () => {
    const hourly = workflow("hourly-maintenance.yml");

    expect(hourly).toContain('cron: "0 * * * *"');
    expect(hourly).toContain("contents: read");
  });
});
