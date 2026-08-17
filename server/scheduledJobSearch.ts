import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { appendWorkflowControlEvent, getWorkflowSettingByTaskUid } from "./db";
import { RESUME_STORAGE_PATH, startVerifiedRun } from "./workflowControls";

export async function runScheduledJobSearch(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const setting = await getWorkflowSettingByTaskUid(user.taskUid);
    if (!setting) return res.json({ ok: true, skipped: "orphan" });
    if (!setting.isEnabled) return res.json({ ok: true, skipped: "disabled" });

    const host = req.get("host");
    if (!host) throw new Error("Scheduled callback could not resolve the deployment host.");
    const task = await startVerifiedRun({
      apiKey: process.env.MANUS_API_KEY,
      confirmed: true,
      resumeUrl: `${req.protocol}://${host}${RESUME_STORAGE_PATH}`,
    });
    await appendWorkflowControlEvent(setting.ownerOpenId, "scheduled-run", "initiated", `Task ${task.taskId} initiated by Heartbeat.`);
    return res.json({ ok: true, taskId: task.taskId });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: detail, timestamp: new Date().toISOString() });
  }
}
