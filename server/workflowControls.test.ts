import { describe, expect, it } from "vitest";
import { assertManualConfirmation, buildVerifiedRunRequest, RESUME_STORAGE_PATH, resolveHeartbeatActorSession, startVerifiedRun, VERIFIED_WORKFLOW_CONNECTORS } from "./workflowControls";
import { permanentExclusion, scheduleBoundary } from "./workflowData";

describe("verified job-search controls", () => {
  it("requires an explicit confirmation before a manual run can be created", () => {
    expect(() => assertManualConfirmation(false)).toThrow(/confirmed manual-trigger/i);
    expect(() => assertManualConfirmation(true)).not.toThrow();
  });

  it("keeps the permanent exclusion and resume attachment in the generated task request", () => {
    const request = buildVerifiedRunRequest(`https://example.com${RESUME_STORAGE_PATH}`);
    const text = request.message.content[0];
    const file = request.message.content[1];
    expect(text.type).toBe("text");
    expect(text.text).toContain(permanentExclusion);
    expect(file).toEqual({ type: "file", file_url: `https://example.com${RESUME_STORAGE_PATH}` });
    expect(request.message.connectors).toEqual(VERIFIED_WORKFLOW_CONNECTORS);
    expect(VERIFIED_WORKFLOW_CONNECTORS).toContain("9444d960-ab7e-450f-9cb9-b9467fb0adda");
    expect(VERIFIED_WORKFLOW_CONNECTORS).toContain("be268223-40b2-4f3c-a907-c12eb1699283");
  });

  it("uses the static project attachment path instead of embedding resume bytes in the task request", () => {
    expect(RESUME_STORAGE_PATH).toMatch(/^\/manus-storage\/Production_Officer_Resume_10_July_2026_/);
  });

  it("fails safely before remote task creation when the server API key is unavailable", async () => {
    await expect(startVerifiedRun({ apiKey: undefined, confirmed: true, resumeUrl: "https://example.com/resume.pdf" })).rejects.toThrow(/MANUS_API_KEY must be configured/i);
  });

  it("declares the retained agent schedule as read-only to prevent a duplicate replacement", () => {
    expect(scheduleBoundary.controlMode).toBe("external-agent-read-only");
    expect(scheduleBoundary.description).toMatch(/Gmail, web-research and résumé-attachment capabilities/i);
    expect(scheduleBoundary.description).toMatch(/no duplicate/i);
  });

  it("uses the project-owner actor for dashboard control of a project-owned Heartbeat", () => {
    expect(resolveHeartbeatActorSession({ requestOpenId: "owner", ownerOpenId: "owner", sessionToken: "browser-session" })).toBe("");
    expect(resolveHeartbeatActorSession({ requestOpenId: "member", ownerOpenId: "owner", sessionToken: "browser-session" })).toBe("browser-session");
  });
});
