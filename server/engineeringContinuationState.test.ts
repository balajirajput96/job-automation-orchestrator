import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const state = JSON.parse(
  readFileSync(resolve(process.cwd(), "engineering-continuation-state.json"), "utf8"),
) as {
  maximumExecutionCycles: number;
  latestExecution: { number: number; validationStatus: string };
  existingAutomation: Array<{ name: string; status: string; frequency: string }>;
  secretsRecorded: boolean;
};

describe("engineering continuation state", () => {
  it("records a bounded, recoverable and secret-free initial execution", () => {
    expect(state.maximumExecutionCycles).toBe(2400);
    expect(state.latestExecution).toMatchObject({ number: 2, validationStatus: "verified" });
    expect(state.existingAutomation).toContainEqual(
      expect.objectContaining({
        name: "Production Officer job applications",
        status: "active",
        frequency: "09:00 and 17:00 Asia/Kolkata",
      }),
    );
    expect(state.secretsRecorded).toBe(false);
  });
});
