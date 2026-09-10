import { getControlRoomRepository } from "@/data/repository";
import type { Event, Pilot } from "@/domain";

function pilotLabel(pilot: Pilot): string {
  return `${pilot.type.charAt(0).toUpperCase()}${pilot.type.slice(1)} Pilot`;
}

function eventLabel(event: Event): string {
  const label = event.payload.label;
  return typeof label === "string" ? label : event.type.replaceAll("_", " ");
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function HomePage() {
  const repository = getControlRoomRepository();
  const snapshot = await repository.getSnapshot();
  const activePilots = snapshot.pilots.filter((pilot) => pilot.status === "active").length;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Revenue Pilots</p>
          <h1>Control Room</h1>
        </div>
        <div className={`health health--${snapshot.autopilotStatus}`}>
          <span className="healthDot" aria-hidden="true" />
          <span>Autopilot {snapshot.autopilotStatus}</span>
        </div>
      </header>

      <section className="heroCard" aria-labelledby="autopilot-heading">
        <div>
          <p className="sectionLabel">Business Autopilot</p>
          <h2 id="autopilot-heading">Your business is working.</h2>
          <p>{snapshot.autopilotMessage}</p>
        </div>
        <div className="heroStats" aria-label="Current status summary">
          <div>
            <strong>{snapshot.activeWork.length}</strong>
            <span>active jobs</span>
          </div>
          <div>
            <strong>{activePilots}</strong>
            <span>pilots running</span>
          </div>
          <div>
            <strong>{snapshot.approvals.length}</strong>
            <span>needs you</span>
          </div>
        </div>
      </section>

      <div className="dashboardGrid">
        <section className="panel panel--wide" aria-labelledby="active-work-heading">
          <div className="panelHeader">
            <div>
              <p className="sectionLabel">Active work</p>
              <h2 id="active-work-heading">In progress</h2>
            </div>
            <span className="countPill">{snapshot.activeWork.length}</span>
          </div>

          <div className="workList">
            {snapshot.activeWork.map((item) => (
              <article className="workCard" key={item.job.job_id}>
                <div className="workHeading">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <strong className="progressNumber">{item.progress}%</strong>
                </div>
                <div
                  className="progressTrack"
                  role="progressbar"
                  aria-label={`${item.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                >
                  <span className="progressFill" style={{ width: `${item.progress}%` }} />
                </div>
                <div className="workMeta">
                  <span>{item.checkpointLabel}</span>
                  <span>{pilotLabel(snapshot.pilots.find((pilot) => pilot.pilot_id === item.job.pilot_id) ?? snapshot.pilots[0])}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel attentionPanel" aria-labelledby="needs-you-heading">
          <div className="panelHeader">
            <div>
              <p className="sectionLabel">Needs you</p>
              <h2 id="needs-you-heading">Approvals</h2>
            </div>
            <span className="countPill countPill--attention">{snapshot.approvals.length}</span>
          </div>

          {snapshot.approvals.map(({ approval, title, detail }) => (
            <article className="approvalCard" key={approval.approval_id}>
              <span className="approvalBadge">Owner decision</span>
              <h3>{title}</h3>
              <p>{detail}</p>
              <dl className="targetMeta">
                <div>
                  <dt>PR</dt>
                  <dd>#{approval.pull_request_number}</dd>
                </div>
                <div>
                  <dt>SHA</dt>
                  <dd>{approval.commit_sha.slice(0, 8)}</dd>
                </div>
              </dl>
              <button type="button" disabled title="Actions will be connected after the approval API is wired.">
                Review exact target
              </button>
            </article>
          ))}
        </section>

        <section className="panel" aria-labelledby="pilots-heading">
          <div className="panelHeader">
            <div>
              <p className="sectionLabel">Pilots</p>
              <h2 id="pilots-heading">Who is working</h2>
            </div>
          </div>
          <div className="pilotList">
            {snapshot.pilots.map((pilot) => (
              <div className="pilotRow" key={pilot.pilot_id}>
                <span className={`pilotDot pilotDot--${pilot.status}`} aria-hidden="true" />
                <div>
                  <strong>{pilotLabel(pilot)}</strong>
                  <span>{pilot.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" aria-labelledby="activity-heading">
          <div className="panelHeader">
            <div>
              <p className="sectionLabel">Activity</p>
              <h2 id="activity-heading">Recently</h2>
            </div>
          </div>
          <ol className="activityList">
            {snapshot.activity.map((event) => (
              <li key={event.event_id}>
                <span className="timelineDot" aria-hidden="true" />
                <div>
                  <strong>{eventLabel(event)}</strong>
                  <span>{formatTime(event.created_at)}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="footerNote">
        <span>Client #001 · {snapshot.organization.name}</span>
        <span>Snapshot {formatTime(snapshot.capturedAt)}</span>
      </footer>
    </main>
  );
}
