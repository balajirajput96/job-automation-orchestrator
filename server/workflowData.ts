import { applicationRecords as auditApplications, auditSource, runRecords as auditRuns } from "./generatedAuditSnapshot";

export type ApplicationRecord = typeof auditApplications[number];
export type RunRecord = typeof auditRuns[number];

export const applicationRecords = auditApplications;
export const runRecords = auditRuns;
export { auditSource };

const latestAuditedRun = runRecords[0];
const auditedRunTime = latestAuditedRun?.label.match(/\((\d{2}:\d{2} IST)\)$/)?.[1];

export const latestRun = {
  date: latestAuditedRun?.date ?? "No audited run",
  time: auditedRunTime ?? "Recorded time unavailable",
} as const;

export const permanentExclusion = "aman.kumar@elysiumpharma.com";

export const integrations = [
  { name: "Gmail", detail: "balajirajput968@gmail.com", status: "Connected" },
  { name: "GitHub", detail: "balajirajput96", status: "Connected" },
  { name: "Julius AI", detail: "Not configured in this task", status: "Action required" },
  { name: "Google Workspace", detail: "Connected", status: "Connected" },
  { name: "Antigravity CLI", detail: "Not installed", status: "Action required" },
] as const;

export const candidateProfile = {
  name: "Balaji",
  qualification: "Diploma in Biotechnology",
  experience: "2+ years experience in OSD/tablet compression",
  location: "Vadodara",
  availability: "Immediate joiner",
} as const;

export const scheduleBoundary = {
  controlMode: "external-agent-read-only",
  label: "Agent scheduled",
  description: "The active 09:00 and 17:00 IST agent workflow retains Gmail, web-research and résumé-attachment capabilities. Dashboard pause/resume controls stay unavailable so no duplicate or weaker replacement schedule is created.",
} as const;

export const workflowPolicy = `Twice daily, find current Production Officer, Manufacturing Officer, Biotechnology Production, Bioprocess, Manufacturing Trainee, and walk-in opportunities, prioritizing Vadodara and nearby locations, then Ankleshwar/Bharuch, Ahmedabad, Mumbai, and the rest of India. Include suitable entry-level or fresher-eligible biotechnology/pharma production roles only where the stated qualification or transferable experience makes the candidate reasonably eligible. Use web sources and public Instagram/Facebook posts only for research. Do not attempt Instagram or Facebook direct messages.

Candidate: Balaji Dilipsingh Rajput; 2+ years Production Officer Grade-1 experience in tablet compression and OSD; Diploma in Biotechnology; immediate joiner; expected CTC negotiable. Apply by Gmail only when a current, role-relevant job posting explicitly publishes a company/HR/recruiter application email and it is independently verifiable from an employer or credible source. Never email inferred, generic-without-vacancy, unrelated, stale, bulk-sourced, or unclear contacts; do not use a fixed contact-volume quota.

Draft a brief employer- and role-specific email. Transparently state the Diploma in Biotechnology whenever it differs from the listed education requirements. Attach the supplied Production_Officer_Resume_10_July_2026.pdf and send no more than five new qualified applications per run from balajirajput968@gmail.com. Before sending, search Gmail to ensure the recipient has not already been contacted for the same or a substantially similar role.

Never search for, draft to, or send any job application, follow-up, or other outreach to aman.kumar@elysiumpharma.com. This permanent exclusion overrides every standing authorization.

Maintain the audit trail with the source URL, employer, role, location, published contact, currentness evidence, eligibility rationale, duplicate-check result, no-send reason or application outcome, sent time, and message ID when applicable. Report verified results in the task.`;
