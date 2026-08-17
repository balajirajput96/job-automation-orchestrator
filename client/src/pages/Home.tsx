import { AlertTriangle, ArrowUpRight, BriefcaseBusiness, CalendarClock, CheckCircle2, CircleDashed, ExternalLink, MapPin, Play, RefreshCw, ShieldBan, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const IST_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatTime(timestamp: number) {
  return `${IST_FORMAT.format(new Date(timestamp))} IST`;
}

export default function Home() {
  const auth = useAuth();
  const dashboard = trpc.workflow.dashboard.useQuery();
  const settings = trpc.workflow.settings.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const scheduleMutation = trpc.workflow.setScheduleEnabled.useMutation({
    onSuccess: () => utils.workflow.settings.invalidate(),
    onError: () => toast.error("Sign in is required to update the schedule control."),
  });
  const runMutation = trpc.workflow.manualRun.useMutation({
    onSuccess: ({ taskUrl }) => {
      toast.success("Verified job-search run initiated.");
      setDialogOpen(false);
      if (taskUrl) window.open(taskUrl, "_blank", "noopener,noreferrer");
    },
    onError: error => toast.error(error.message),
  });

  const data = dashboard.data;
  const applicationRows = useMemo(() => {
    if (!data) return [];
    const value = filter.trim().toLowerCase();
    return data.applications.filter(application => !value || [application.employer, application.role, application.location, application.recipient].join(" ").toLowerCase().includes(value));
  }, [data, filter]);

  if (auth.loading || dashboard.isLoading) return <div className="loading">Loading verified workflow snapshot…</div>;
  if (!auth.isAuthenticated || dashboard.isError || !data) {
    return <div className="loading"><div style={{ textAlign: "center" }}><div className="eyebrow" style={{ marginBottom: 12 }}>Private control surface</div><div style={{ font: '600 30px/1.05 "Fraunces", Georgia, serif', color: "#f4f9ef", marginBottom: 12 }}>Sign in to view the workflow.</div><button className="button-confirm" onClick={() => startLogin()}>Sign in securely</button></div></div>;
  }
  const scheduleEnabled = settings.data?.isEnabled ?? true;
  const scheduleManaged = Boolean(settings.data?.heartbeatTaskUid);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><BriefcaseBusiness size={17} /></span><span>Verified Workflows</span></div>
        <div className="top-status"><span className="status-dot" />Active workflow status</div>
      </header>
      <main className="page">
        <section className="hero">
          <div>
            <div className="eyebrow">Job-search automation · control room</div>
            <h1>Every decision, in view.</h1>
            <p>A deliberate command center for a high-integrity application workflow. Currentness, eligibility, published contacts and Gmail history are all part of the process—not afterthoughts.</p>
          </div>
          <button className="refresh" onClick={() => { dashboard.refetch(); settings.refetch(); }} aria-label="Refresh dashboard data"><RefreshCw size={15} /> Refresh snapshot</button>
        </section>

        <section className="cards" aria-label="Workflow summary">
          <article className="metric"><div className="metric-label"><BriefcaseBusiness size={14} /> Total applications sent</div><div className="metric-value">{data.applications.length}</div><div className="metric-note">Audited Gmail message records</div></article>
          <article className="metric"><div className="metric-label"><CalendarClock size={14} /> Last run time</div><div className="metric-value" style={{ fontSize: 18 }}>17 Aug 2026</div><div className="metric-note">17:06 IST · latest recorded run</div></article>
          <article className="metric"><div className="metric-label"><CircleDashed size={14} /> Next scheduled run</div><div className="metric-value" style={{ fontSize: 18 }}>09:00 IST</div><div className="metric-note">Then 17:00 IST · daily</div></article>
          <article className="metric"><div className="metric-label"><CheckCircle2 size={14} /> Current active workflow status</div><div className="metric-value" style={{ fontSize: 18, color: "#c9ee99" }}>Active</div><div className="metric-note">Verified-only application mode</div></article>
        </section>

        <section className="grid-two">
          <div>
            <article className="panel danger-panel" aria-label="Permanent exclusion warning">
              <h2 className="danger-title"><ShieldBan size={16} /> PERMANENT EXCLUSION — NEVER CONTACT</h2>
              <div className="danger-email">aman.kumar@elysiumpharma.com</div>
              <p className="danger-copy">This address can never be contacted under any circumstance. This restriction overrides every standing authorization and is permanently visible in this dashboard.</p>
            </article>

            <article className="panel" id="applications">
              <div className="panel-head"><div><h2 className="panel-title">Application log</h2><p className="panel-copy">Every sent application record reconciled from the workflow audit and Gmail message IDs.</p></div><span className="pill">{applicationRows.length} shown</span></div>
              <input aria-label="Filter applications" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter employer, role, location or recipient" style={{ width: "100%", marginBottom: 14, borderRadius: 10, border: "1px solid rgba(241,248,232,.12)", background: "rgba(6,10,6,.2)", color: "#eff5e8", padding: "11px 12px", outline: "none" }} />
              <div className="table-wrap"><table><thead><tr><th>Employer</th><th>Role</th><th>Location</th><th>Recipient email</th><th>Sent time</th><th>Gmail message ID</th></tr></thead><tbody>
                {applicationRows.map(record => <tr key={record.messageId}><td><span className="employer">{record.employer}</span>{record.historicalExclusion && <span className="historical">Historical incident — permanently excluded now</span>}</td><td>{record.role}</td><td><MapPin size={12} style={{ marginRight: 5, verticalAlign: -2, color: "#9fbd80" }} />{record.location}</td><td>{record.recipient}</td><td>{formatTime(record.sentAt)}</td><td><span className="mono-id" title={record.messageId}>{record.messageId}</span></td></tr>)}
              </tbody></table></div>
            </article>

            <article className="panel" id="runs">
              <div className="panel-head"><div><h2 className="panel-title">Run history</h2><p className="panel-copy">Verified search outcomes, no-send decisions, and research evidence.</p></div></div>
              <div className="feed">{data.runs.map(run => <article className="feed-item" key={run.id}><div className="feed-meta"><span>{run.date}</span><span>{run.reviewed} reviewed · {run.sent} sent</span></div><h3>{run.label}</h3><p>{run.decision}</p><div className="source-links">{run.sources.map((source, index) => <a key={source} href={source} target="_blank" rel="noreferrer">Source {index + 1} <ArrowUpRight size={10} style={{ display: "inline", verticalAlign: -1 }} /></a>)}</div></article>)}</div>
            </article>
          </div>

          <aside>
            <article className="panel schedule-card" id="schedule">
              <div className="panel-head"><div><h2 className="panel-title">Scheduled run configuration</h2><p className="panel-copy">Twice-daily verified search and application cadence.</p></div><span className="pill">{scheduleEnabled ? "Enabled" : "Disabled"}</span></div>
              <div className="schedule-time"><strong>09:00 IST</strong><span>Daily research + verified applications</span></div>
              <div className="schedule-time"><strong>17:00 IST</strong><span>Daily research + verified applications</span></div>
              <div className="schedule-time"><strong>13 Oct 2026</strong><span>Schedule expiry date</span></div>
              <div className="control-row"><div><div style={{ color: "#eaf1e2", fontWeight: 600, fontSize: 13 }}>Schedule control</div><div className="panel-copy">{scheduleManaged ? "Protected live pause/resume control." : "Migration pending. Existing schedule remains active."}</div></div><button className="toggle" data-on={scheduleEnabled} disabled={!scheduleManaged} onClick={() => scheduleMutation.mutate({ enabled: !scheduleEnabled })} aria-label="Toggle schedule" style={{ opacity: scheduleManaged ? 1 : .45, cursor: scheduleManaged ? "pointer" : "not-allowed" }}><span className="toggle-knob" /></button></div>
              <button className="trigger" onClick={() => setDialogOpen(true)}><Play size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 7 }} />Initiate verified job-search run</button>
            </article>

            <article className="panel"><div className="panel-head"><div><h2 className="panel-title">Control activity</h2><p className="panel-copy">Persistent record of dashboard schedule and manual-run actions.</p></div></div>
              {data.controlEvents.length === 0 ? <div className="panel-copy" style={{ padding: "8px 0" }}>No dashboard control actions recorded yet.</div> : <div className="feed">{data.controlEvents.map(event => <div className="feed-item" key={event.id}><div className="feed-meta"><span>{event.action}</span><span>{new Date(event.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })} IST</span></div><h3 style={{ textTransform: "capitalize" }}>{event.outcome}</h3><p>{event.detail}</p></div>)}</div>}
            </article>

            <article className="panel" id="integrations"><div className="panel-head"><div><h2 className="panel-title">Integration status</h2><p className="panel-copy">Linked services and controller readiness.</p></div></div>{data.integrations.map(integration => <div className="integration-row" key={integration.name}><div><div className="integration-name">{integration.name}</div><div className="integration-detail">{integration.detail}</div></div><span className={`integration-status ${integration.status === "Action required" ? "action" : ""}`}>{integration.status}</span></div>)}</article>

            <article className="panel" id="profile"><div className="panel-head"><div><h2 className="panel-title">Candidate profile</h2><p className="panel-copy">Exact profile used to assess every verified role.</p></div><UserRound size={18} color="#c8e895" /></div><div className="profile-grid"><div className="profile-item"><span>Name</span><strong>{data.candidateProfile.name}</strong></div><div className="profile-item"><span>Based in</span><strong>{data.candidateProfile.location}</strong></div><div className="profile-item"><span>Qualification</span><strong>{data.candidateProfile.qualification}</strong></div><div className="profile-item"><span>Availability</span><strong>{data.candidateProfile.availability}</strong></div><div className="profile-item" style={{ gridColumn: "1 / -1" }}><span>Experience</span><strong>{data.candidateProfile.experience}</strong></div></div></article>
          </aside>
        </section>
      </main>

      {dialogOpen && <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="run-title"><div className="eyebrow">Manual trigger safeguard</div><h2 id="run-title">Start a verified run?</h2><p>This creates a Manus API task for a fresh job-search run. The task remains bound to the same currentness, eligibility, duplicate-check, résumé-attachment, five-application limit and permanent-exclusion rules.</p><div className="dialog-actions"><button className="button-muted" onClick={() => setDialogOpen(false)}>Cancel</button><button className="button-confirm" disabled={runMutation.isPending} onClick={() => runMutation.mutate({ confirmed: true })}>{runMutation.isPending ? "Starting…" : "Confirm and initiate"}</button></div></section></div>}
    </div>
  );
}
