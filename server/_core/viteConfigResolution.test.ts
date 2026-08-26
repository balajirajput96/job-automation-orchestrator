import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveDevelopmentViteConfig } from "./vite";

describe("development Vite configuration", () => {
  it("resolves the exported config function before middleware startup", async () => {
    const config = await resolveDevelopmentViteConfig();

    expect(config.root).toBe(path.resolve(import.meta.dirname, "../..", "client"));
    expect(config.publicDir).toBe(path.resolve(import.meta.dirname, "../..", "client", "public"));
  });
});
