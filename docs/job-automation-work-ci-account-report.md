# Job-Automation Work, CI Repair, and Account-Status Report

**Prepared:** 18 August 2026 (IST)  
**Candidate:** Balaji Dilipsingh Rajput  
**Project:** `balajirajput96/job-automation-orchestrator`  
**Purpose:** A sanitized, reproducible record of the job-application workflow, dashboard code, CI/rebase work, and currently verified connection state.

> This report deliberately omits passwords, access tokens, cookie values, secret files, internal platform instructions, and private account-session data. The accompanying source archive contains the complete project source needed to inspect or reproduce the application; it excludes dependencies, build artefacts, Git internals, and runtime logs.

## 1. Work completed in this chat

The work created and maintained a verified job-application workflow for Production Officer, Manufacturing Officer, OSD/tablet-compression, biotechnology production, bioprocess, manufacturing trainee, and eligible walk-in roles. The automated discovery priority is Vadodara, Ankleshwar/Bharuch, Ahmedabad, Mumbai, then the rest of India.

| Area | Delivered work |
|---|---|
| Candidate workflow | Used the supplied résumé, documented the candidate as an immediate joiner with 2+ years of tablet-compression/OSD experience, and transparently disclosed the Diploma in Biotechnology whenever postings specified a different formal qualification. |
| Application safeguards | Limited sending to current, role-specific postings with explicitly published and independently corroborated recruitment contacts. Gmail history is checked before every send. No generic, inferred, stale, unclear, or bulk contacts are used. |
| Permanent exclusion | `aman.kumar@elysiumpharma.com` is permanently blocked from search, draft, send, follow-up, and all other outreach. |
| Channels | Public web and public Instagram/Facebook posts are research-only. Applications are sent by Gmail only. No Instagram or Facebook direct messages are attempted. |
| Audits | Maintained the append-only evidence log at `/home/ubuntu/job_search_findings.md` and the user-facing summary at `/home/ubuntu/job_application_workflow_audit.md`. |
| Dashboard | Built and maintained the React, TypeScript, tRPC, Express, Tailwind, and database-backed dashboard at `/home/ubuntu/job-automation-orchestrator`. It shows application records, run history, candidate profile, the external schedule boundary, and the permanent exclusion. |
| Current audited state | The dashboard snapshot records **43 application records** and **12 verified run records** after the 18 August run. |
| Schedule | The proven external agent schedule remains the single active runner at 09:00 and 17:00 IST through 13 October 2026. The previously tested managed-callback alternative is intentionally not used because dispatch was not reliably proven. |

## 2. Recent verified application run

The 18 August 2026 run reviewed nine current or recent postings. Two were sent only after Gmail duplicate checks found no earlier recipient outreach.

| Employer | Role | Recipient | Outcome |
|---|---|---|---|
| Viyash Scientific Limited Unit-V | Production Chemist / Junior Chemist, Jeedimetla | `kuladeep.m@viyash.com` | Sent with résumé; message ID `1a012f040cfc7eb8`. The email stated that the candidate has a Diploma in Biotechnology while the posting listed B.Sc./B.Pharm. |
| Ichor Biologics Pvt. Ltd. | Production – Downstream, Shameerpet | `careers@ichor.in` | Sent with résumé; message ID `1a012f1714b87941`. The email stated the Diploma in Biotechnology and the transferable OSD-production background. |

Lupin, Sunrise Remedies, SunGlow, Lincoln, Zydus, Ipca, and InvaGen were not sent a new application because of a stated experience/qualification mismatch, duplicate protection, no published email route, incomplete evidence, a past date, or non-India location. Full source URLs and reasoning are retained in the append-only audit.

## 3. Dashboard code and source map

The archive delivered with this report is the authoritative complete code package. The table below maps the principal custom files.

| File | Responsibility |
|---|---|
| `client/src/pages/Home.tsx` | Main workflow dashboard interface, status cards, application table, run history, schedule boundary, and restriction notice. |
| `server/routers.ts` | Typed tRPC procedures for workflow data, read-only schedule handling, and safeguarded manual-run request creation. |
| `server/workflowData.ts` | Presents generated audit-derived data to the server/UI contract. |
| `server/generatedAuditSnapshot.ts` | Generated snapshot from the append-only audit; currently 43 applications and 12 runs. |
| `scripts/sync-workflow-audit.mjs` | Parses the structured audit blocks and rebuilds the generated dashboard snapshot. |
| `server/generatedAuditSnapshot.test.ts` | Regression test proving current snapshot count/order, source, URLs, and permanent-exclusion record handling. |
| `server/auditOnlyRebuild.test.ts` | Test for rebuilding the snapshot only from audit evidence. |
| `.github/workflows/verify.yml` | GitHub Actions workflow for locked install, TypeScript validation, and the Vitest suite. |
| `docs/ci-status.md` | Human-readable record of CI repairs and the Dependabot queue boundary. |
| `todo.md` | Append-only project completion tracker. |

### Current audit-snapshot regression test

```ts
import { describe, expect, it } from "vitest";
import { applicationRecords, auditSource, runRecords } from "./generatedAuditSnapshot";

describe("generated audit snapshot", () => {
  it("preserves the append-only job-search audit as its declared source", () => {
    expect(auditSource).toBe("/home/ubuntu/job_search_findings.md");
    expect(applicationRecords).toHaveLength(43);
    expect(applicationRecords[0]).toMatchObject({
      employer: "Viyash Scientific Limited Unit-V",
      recipient: "kuladeep.m@viyash.com",
      historicalExclusion: false,
    });
    expect(applicationRecords.some(record => record.recipient.includes("aman.kumar@elysiumpharma.com"))).toBe(true);
  });

  it("includes audited scheduled-run history with real source URLs", () => {
    expect(runRecords).toHaveLength(12);
    expect(runRecords[0]).toMatchObject({ id: "audit-run-12", reviewed: 9, sent: 2 });
    expect(runRecords.every(run => run.sources.length > 0)).toBe(true);
    expect(runRecords.map(run => run.reviewed)).toEqual([9, 2, 1, 7, 10, 4, 4, 4, 4, 5, 4, 7]);
    expect(runRecords.map(run => run.sent)).toEqual([2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1]);
  });
});
```

## 4. GitHub CI failures, fixes, and rebase policy

The instruction followed for Git history is: **repair every code-controlled failure first, verify the repaired state locally and in GitHub Actions, then rebase.**

| Historical finding | Root cause | Repair | Verification result |
|---|---|---|---|
| GitHub run `32085071786` failed | `pnpm/action-setup` was configured with a broad `version: 10` while `package.json` already pinned a precise pnpm version. | Removed the conflicting workflow version declaration and used the package-manager pin as the single source of truth. | Later dashboard verification runs succeeded. |
| GitHub run `32085158642` failed | The same pnpm-version conflict remained on that historical commit. | The workflow repair was committed and verified by subsequent successful runs. | Later runs `32085351764`, `32091486350`, `32091629474`, `32092304061`, `32093433493`, `32093618089`, and `32094656563` succeeded. |
| CI tests depended on local/external state | A test expected `/home/ubuntu/job_search_findings.md` and an injected key that is not present in GitHub Actions. | Isolated the audit rebuild test with an in-repository fixture and made the credential-dependent behavior unit-testable without a live secret. | GitHub CI and local test suite passed. |
| New verified application audit increased data counts | Snapshot tests still expected 41 applications and 11 runs after the audit was rebuilt to 43 applications and 12 runs. | Updated exact regression assertions for the new audited data. | TypeScript, 11 tests, and production build passed. |

Two old Dependabot-created jobs (`32085098488` and `32085096521`) remain in GitHub’s queued state with no assigned runner. They are dynamic platform-managed dependency jobs, not the repository’s application verification workflow; no source-code change can execute or resolve an unassigned external runner. Their state is documented in `docs/ci-status.md` rather than misclassified as an application-code failure.

The latest known code-verification run in this audit is `32094656563`, which completed successfully. A prior clean rebase was already completed before the current dashboard/audit checkpoint. The current local work will again be committed, verified through GitHub CI, and rebased only after that fresh pass.

## 5. Safe, reproducible terminal command record

The following commands represent the safe project commands used for the build, audit, test, CI inspection, and rebase workflow. They do not contain credentials.

```bash
# Enter the project
cd /home/ubuntu/job-automation-orchestrator

# Rebuild dashboard data only from the append-only workflow audit
node scripts/sync-workflow-audit.mjs --from-audit

# Validate the application
pnpm install --frozen-lockfile
pnpm check
pnpm test --run
pnpm build

# Inspect the repository and recent GitHub Actions runs
git status --short --branch
git remote -v
gh run list --repo balajirajput96/job-automation-orchestrator --limit 100 \
  --json databaseId,status,conclusion,displayTitle,event,headBranch,headSha,createdAt,updatedAt

# Inspect one failed historical workflow without changing it
gh run view <run-id> --repo balajirajput96/job-automation-orchestrator --log-failed

# Commit only after local validation is clean, push, and wait for the fresh CI run
git add <reviewed-files>
git commit -m "docs: record verified workflow state"
git push github main
gh run watch <fresh-run-id> --repo balajirajput96/job-automation-orchestrator

# Rebase only after the fresh GitHub Actions result is successful
git fetch github
git rebase github/main
git status --short --branch
```

> No destructive `git reset --hard` command is used. If a project recovery were necessary, the dashboard checkpoint/rollback mechanism is used instead.

## 6. Current connected-account and browser status

This section reports only directly checked, task-relevant state. It does not inspect saved passwords, browser cookie stores, recovery data, or every account that may exist in a browser.

| Service or surface | Observed state |
|---|---|
| GitHub CLI | Authenticated as `balajirajput96`; repository and GitHub Actions inspection are available. |
| GitHub in the browser | **Logged out** at the time of the read-only check; the page displayed **Sign in** and **Sign up**. This is separate from GitHub CLI authentication. |
| Gmail | Enabled and active for `balajirajput968@gmail.com`; this is the connected job-application sending account. |
| Google Calendar / Google Workspace | Enabled with `balajirajput968@gmail.com` known, but no selected active account was reported in this check. |
| Meta Ads Manager | Enabled with `balajidilip930@gmail.com` known, but no selected active account was reported. It is not used by the job workflow. |
| My Browser | Enabled; it can use an authenticated browser session if one exists, but it does not prove that every website is currently logged in. |
| Anchor Browser | Disabled. |
| Playwright | Enabled as a browser-automation capability; it is not itself an account login. |
| Julius / Gemini / Spark | Not revalidated in this latest read-only check. Prior historical access should not be treated as proof of a current live browser session. |
| “Thug” | No configured or observed integration/account with this name. |
| “Account Integrity” | No configured or observed standalone integration/account with this name. |

The detailed connection evidence is retained in `docs/connection-status-findings.md`.

## 7. Files delivered with this report

| File | Content |
|---|---|
| `job-automation-orchestrator-source-2026-08-18.zip` | Complete project source export, excluding `node_modules`, build output, Git internals, logs, and secret/config files. |
| `docs/job-automation-work-ci-account-report.md` | This human-readable report. |
| `docs/connection-status-findings.md` | Sanitized, direct account/browser/connector evidence. |
| `job_search_findings.md` | Append-only vacancy, application, source, and duplicate-protection audit. |
| `job_application_workflow_audit.md` | User-facing workflow audit. |

## 8. Current next actions

The next safe actions are to commit this documentation and current tracker, rerun local validation, wait for the resulting GitHub Actions run to pass, then rebase and record the synchronized clean-branch state. The external twice-daily job-search schedule remains unchanged while this repository maintenance is completed.
