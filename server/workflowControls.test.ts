import { describe, expect, it } from "vitest";
import { assertManualConfirmation, buildVerifiedRunRequest, RESUME_STORAGE_PATH } from "./workflowControls";
import { permanentExclusion } from "./workflowData";

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
  });

  it("uses the static project attachment path instead of embedding resume bytes in the task request", () => {
    expect(RESUME_STORAGE_PATH).toMatch(/^\/manus-storage\/Production_Officer_Resume_10_July_2026_/);
  });
});
