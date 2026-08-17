import { describe, expect, it } from "vitest";
import { heartbeatProbeResult } from "./heartbeatProbe";

describe("Heartbeat probe", () => {
  it("accepts only authenticated cron identities with a task UID", () => {
    expect(heartbeatProbeResult({ isCron: true, taskUid: "cron-task" })).toEqual({ ok: true, taskUid: "cron-task" });
    expect(heartbeatProbeResult({ isCron: true })).toEqual({ ok: false, error: "cron-only" });
    expect(heartbeatProbeResult({})).toEqual({ ok: false, error: "cron-only" });
  });
});
