import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectPath = process.cwd();
const auditPath = "/home/ubuntu/job_search_findings.md";
const rowsPath = resolve(projectPath, "gmail_application_rows.tsv");
const generatedPath = resolve(projectPath, "server/generatedAuditSnapshot.ts");
const reconciliationMarker = "<!-- dashboard-gmail-reconciliation-records:v1 -->";
const runHistoryMarker = "<!-- dashboard-run-history-records:v1 -->";
const auditOnly = process.argv.includes("--from-audit");

const profileByRecipient = {
  "naidupetahr@aurobindo.com": ["APL Healthcare Limited – Unit IV", "Technical Assistant – Production (OSD/Compression)", "Naidupeta/Tirupati"],
  "abhishekd.parmar@ipca.com": ["IPCA Laboratories", "QA / IPQA Officer", "Pologround, Indore"],
  "hr.waluj@indoco.com": ["Indoco Remedies", "OSD Tablet Compression / Production Role", "Waluj"],
  "raghuveera.vutla@aizant.com": ["Aizant Drug Research Solutions", "IPQA Executive", "Hyderabad"],
  "hr@unixbiotech.com": ["Unix Biotech", "Production Officer – Tablet & Capsule Manufacturing", "Baddi, Himachal Pradesh"],
  "career@rivpraformulation.com": ["Rivpra Formulation Pvt. Ltd.", "Production Executive – Coating / Compression (OSD)", "Haridwar, Uttarakhand"],
  "info@sunriseremedies.in": ["Sunrise Remedies Pvt. Ltd.", "Production – OSD Capsule Filling", "Santej, Ahmedabad, Gujarat"],
  "hr@kashmik.com": ["Kashmik Formulation Pvt. Ltd.", "Production Officer", "Ahmedabad / Sanand GIDC, Gujarat"],
  "aman.kumar@elysiumpharma.com": ["Elysium Pharmaceutical Ltd.", "Production Officer – Tablet Compression / OSD", "Vadodara, Gujarat"],
  "hrvirochannagar@torrentpharma.com": ["Torrent Pharma", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hr.tandalja@sunpharma.com": ["Sun Pharma", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hrd_matoda@intaspharma.com": ["Intas Pharmaceuticals", "Production Officer / OSD Manufacturing", "Matoda, Ahmedabad, Gujarat"],
  "careers@alembic.co.in": ["Alembic Pharmaceuticals", "Production Officer / OSD Manufacturing", "Vadodara, Gujarat"],
  "vinayak@lactoseindialimited.com": ["Lactose India Limited", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hr@celogenpharma.com": ["Celogen Pharma", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hr@medozpharmaceuticals.com": ["Medoz Pharmaceuticals", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hr@skant.com": ["Skant", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "recruitment@avenzapharma.com": ["Avenza Pharma", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "indiacareers@amneal.com": ["Amneal Pharmaceuticals", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "careers@emcure.com": ["Emcure Pharmaceuticals", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hr@elysiumpharma.com": ["Elysium Pharmaceuticals", "Production Officer – Tablet Compression / OSD", "Vadodara, Gujarat"],
  "hr.gbu@indswiftlabs.com": ["Ind-Swift Labs", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "careers@lincolnpharma.com": ["Lincoln Pharma", "Production Officer / OSD Manufacturing", "Gandhinagar, Gujarat"],
  "hrd@usv.co.in": ["USV", "Production Officer / OSD Manufacturing", "Location not recorded in job_search_findings.md"],
  "hr1@innoxells.com": ["Innoxel Lifesciences", "Production Officer / OSD Manufacturing", "Vadodara, Gujarat"],
  "india_production@glenmarkpharma.com": ["Glenmark Pharmaceuticals", "Production Officer / OSD Tablet Compression", "Location not recorded in job_search_findings.md"],
  "chandanid@amneal.com": ["Amneal Pharmaceuticals", "Manufacturing Officer – OSD Tablet Compression", "SEZ Matoda, Ahmedabad, Gujarat"],
  "paresh.patel@stallionlabs.com": ["Stallion Laboratories Pvt. Ltd.", "Production – Tablet Compression / OSD", "Ahmedabad, Gujarat"],
  "hr@darshanpharmaindia.in": ["Darshan Healthcare Pvt. Ltd.", "Production Officer / Executive", "Ankleshwar, Gujarat"],
};

const compact = value => value.replace(/\s+/g, " ").trim();
const rowToRecord = line => {
  const [messageId, sentAt, recipient, subject] = line.split("\t");
  if (!messageId || recipient === "balajirajput968@gmail.com") return null;
  const primaryRecipient = recipient.split(",")[0].trim().toLowerCase();
  const [employer, role, location] = profileByRecipient[primaryRecipient] ?? ["Employer not recorded in job_search_findings.md", subject, "Location not recorded in job_search_findings.md"];
  return { messageId, sentAt: Number(sentAt), employer, role, location, recipient, historicalExclusion: recipient.toLowerCase().includes("aman.kumar@elysiumpharma.com") };
};

const getReconciledApplications = markdown => {
  const opening = `${reconciliationMarker}\n\`\`\`json\n`;
  const start = markdown.indexOf(opening);
  if (start < 0) throw new Error("The append-only audit does not yet contain reconciled Gmail application records.");
  const contentStart = start + opening.length;
  const end = markdown.indexOf("\n\`\`\`", contentStart);
  if (end < 0) throw new Error("The reconciled Gmail record block is incomplete.");
  return JSON.parse(markdown.slice(contentStart, end));
};

const getReconciledRunHistory = markdown => {
  const opening = `${runHistoryMarker}\n\`\`\`json\n`;
  const start = markdown.indexOf(opening);
  if (start < 0) throw new Error("The append-only audit does not yet contain normalized run-history records.");
  const contentStart = start + opening.length;
  const end = markdown.indexOf("\n\`\`\`", contentStart);
  if (end < 0) throw new Error("The normalized run-history record block is incomplete.");
  return JSON.parse(markdown.slice(contentStart, end));
};

let audit = await readFile(auditPath, "utf8");
if (!audit.includes(reconciliationMarker)) {
  if (auditOnly) throw new Error("Audit-only rebuild requested before Gmail reconciliation records were appended.");
  const rows = await readFile(rowsPath, "utf8");
  const applications = rows.split("\n").map(rowToRecord).filter(Boolean);
  const reconciliation = `\n\n## Gmail reconciliation snapshot — 17 August 2026 (IST)\n\nThe following machine-readable application records were reconciled from the connected Gmail sent-mail history and are now part of this append-only audit. The dashboard snapshot is regenerated from this audit only. The historical incident involving \`aman.kumar@elysiumpharma.com\` is retained solely for transparency; it remains permanently excluded from all future outreach.\n\n${reconciliationMarker}\n\`\`\`json\n${JSON.stringify(applications, null, 2)}\n\`\`\`\n`;
  audit = `${audit.trimEnd()}${reconciliation}`;
  await writeFile(auditPath, audit);
}

const applications = getReconciledApplications(audit);
const runs = getReconciledRunHistory(audit);
await writeFile(generatedPath, `// Generated by scripts/sync-workflow-audit.mjs from ${auditPath}. Do not edit by hand.\nexport const auditSource = ${JSON.stringify(auditPath)};\nexport const applicationRecords = ${JSON.stringify(applications, null, 2)} as const;\nexport const runRecords = ${JSON.stringify(runs, null, 2)} as const;\n`);
console.log(`Synchronized ${applications.length} application records and ${runs.length} run records from ${auditPath}`);
