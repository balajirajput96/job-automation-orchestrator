import { TRPCError } from "@trpc/server";
import { workflowPolicy } from "./workflowData";

export const RESUME_STORAGE_PATH = "/manus-storage/Production_Officer_Resume_10_July_2026_ed341bc1.pdf";
export const VERIFIED_WORKFLOW_CONNECTORS = [
  "9444d960-ab7e-450f-9cb9-b9467fb0adda", // Gmail
  "be268223-40b2-4f3c-a907-c12eb1699283", // My Browser
] as const;

export function assertManualConfirmation(confirmed: boolean) {
  if (!confirmed) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "A confirmed manual-trigger action is required before creating a job-search task.",
    });
  }
}

export function resolveHeartbeatActorSession({
  requestOpenId,
  ownerOpenId,
  sessionToken,
}: {
  requestOpenId: string;
  ownerOpenId?: string;
  sessionToken: string;
}) {
  // Project-level Heartbeats are created under the owner identity. Calling the
  // SDK with an empty session retains that actor instead of rebinding to a
  // browser session, while non-owner schedules still use the user session.
  return ownerOpenId && requestOpenId === ownerOpenId ? "" : sessionToken;
}

export function buildVerifiedRunRequest(resumeUrl: string) {
  return {
    title: "Verified Production Officer Job Search — Manual Run",
    locale: "en",
    interactive_mode: false,
    share_visibility: "private",
    message: {
      content: [
        { type: "text", text: workflowPolicy },
        { type: "file", file_url: resumeUrl },
      ],
      connectors: VERIFIED_WORKFLOW_CONNECTORS,
    },
  };
}

export async function startVerifiedRun({ apiKey, confirmed, resumeUrl }: { apiKey?: string; confirmed: boolean; resumeUrl: string }) {
  assertManualConfirmation(confirmed);
  if (!apiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "MANUS_API_KEY must be configured before a manual run can be initiated.",
    });
  }
  const response = await fetch("https://api.manus.ai/v2/task.create", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-manus-api-key": apiKey },
    body: JSON.stringify(buildVerifiedRunRequest(resumeUrl)),
  });
  const result = await response.json() as { ok?: boolean; task_id?: string; task_url?: string; error?: { message?: string } };
  if (!response.ok || !result.ok || !result.task_id) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error?.message || "Unable to create the verified job-search task." });
  }
  return { taskId: result.task_id, taskUrl: result.task_url ?? "" };
}
