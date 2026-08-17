import { parse as parseCookie } from "cookie";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { updateHeartbeatJob } from "./_core/heartbeat";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { appendWorkflowControlEvent, getWorkflowSetting, listWorkflowControlEvents, saveWorkflowSetting } from "./db";
import { applicationRecords, auditSource, candidateProfile, integrations, permanentExclusion, runRecords, scheduleBoundary } from "./workflowData";
import { RESUME_STORAGE_PATH, startVerifiedRun } from "./workflowControls";

function requestOrigin(req: { protocol?: string; headers: { host?: string } }) {
  if (!req.headers.host) throw new Error("Unable to resolve dashboard host for resume attachment.");
  return `${req.protocol || "https"}://${req.headers.host}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workflow: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => ({
      applications: applicationRecords,
      runs: runRecords,
      integrations,
      candidateProfile,
      exclusion: permanentExclusion,
      auditSource,
      controlEvents: await listWorkflowControlEvents(ctx.user.openId),
      schedule: { timeOne: "09:00 IST", timeTwo: "17:00 IST", expiry: "13 Oct 2026", status: "active", lastRun: "17 Aug 2026, 17:06 IST", nextRun: "09:00 IST / 17:00 IST daily", ...scheduleBoundary },
    })),
    settings: protectedProcedure.query(async ({ ctx }) => getWorkflowSetting(ctx.user.openId)),
    setScheduleEnabled: protectedProcedure.input(z.object({ enabled: z.boolean() })).mutation(async ({ ctx, input }) => {
      if (process.env.NODE_ENV !== "production") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Publish the dashboard before changing the live Heartbeat schedule." });
      }
      const existing = await getWorkflowSetting(ctx.user.openId);
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      let heartbeatTaskUid = existing.heartbeatTaskUid;
      if (!heartbeatTaskUid) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Schedule migration is pending. The existing twice-daily workflow remains active until it is migrated after deployment." });
      }
      await updateHeartbeatJob(heartbeatTaskUid, { enable: input.enabled }, sessionToken);
      const result = await saveWorkflowSetting(ctx.user.openId, input.enabled, heartbeatTaskUid);
      await appendWorkflowControlEvent(ctx.user.openId, "schedule-toggle", input.enabled ? "enabled" : "disabled", `Heartbeat ${heartbeatTaskUid} ${input.enabled ? "resumed" : "paused"}.`);
      return result;
    }),
    manualRun: protectedProcedure.input(z.object({ confirmed: z.literal(true) })).mutation(async ({ ctx, input }) => {
      const setting = await getWorkflowSetting(ctx.user.openId);
      if (!setting.isEnabled) throw new Error("The verified workflow is disabled. Enable the schedule before initiating a manual run.");
      const task = await startVerifiedRun({ apiKey: process.env.MANUS_API_KEY, confirmed: input.confirmed, resumeUrl: new URL(RESUME_STORAGE_PATH, requestOrigin(ctx.req)).toString() });
      await appendWorkflowControlEvent(ctx.user.openId, "manual-run", "initiated", `Task ${task.taskId} initiated after explicit dashboard confirmation.`);
      return task;
    }),
  }),
});

export type AppRouter = typeof appRouter;
