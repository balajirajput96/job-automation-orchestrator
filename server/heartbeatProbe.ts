import type { Request, Response } from "express";
import { sdk, type AuthenticatedUser } from "./_core/sdk";

export function heartbeatProbeResult(user: Pick<AuthenticatedUser, "isCron" | "taskUid">) {
  if (!user.isCron || !user.taskUid) return { ok: false as const, error: "cron-only" };
  return { ok: true as const, taskUid: user.taskUid };
}

export async function runHeartbeatProbe(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    const result = heartbeatProbeResult(user);
    if (!result.ok) return res.status(403).json(result);
    return res.json({ ok: true, taskUid: result.taskUid, timestamp: new Date().toISOString() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    // Do not log credentials; header presence is enough to diagnose cron auth delivery.
    console.error("[Heartbeat probe] authentication failed", {
      detail,
      hasCookie: Boolean(req.headers.cookie),
      hasAuthorization: Boolean(req.headers.authorization),
    });
    return res.status(500).json({ error: detail, timestamp: new Date().toISOString() });
  }
}
