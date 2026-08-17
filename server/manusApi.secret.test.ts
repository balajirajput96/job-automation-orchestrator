import { describe, expect, it } from "vitest";

describe("MANUS_API_KEY", () => {
  it("authenticates a read-only Manus task-list request", async () => {
    const apiKey = process.env.MANUS_API_KEY;
    expect(apiKey).toBeTruthy();

    const response = await fetch("https://api.manus.ai/v2/task.list?limit=1", {
      headers: { "x-manus-api-key": apiKey! },
    });

    expect(response.ok).toBe(true);
    const payload = await response.json() as { ok?: boolean };
    expect(payload.ok).toBe(true);
  }, 20_000);
});
