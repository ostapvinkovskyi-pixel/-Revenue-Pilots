import { getSeedOwnerViewSnapshot } from "@/data/owner-view";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDayTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function OwnerHomePage() {
  const snapshot = getSeedOwnerViewSnapshot();
  const now = new Date(snapshot.capturedAt);
  const greeting = greetingForHour(now.getHours());

  return (
    <main className="ownerShell">
      <header className="ownerTopbar">
        <div>
          <p className="ownerBrand">Revenue Pilots Autopilot</p>
          <h1>{greeting}, {snapshot.ownerName}</h1>
          <p className="ownerCompany">{snapshot.companyName}</p>
        </div>
        <div className={`ownerStatus ownerStatus--${snapshot.overallStatus}`}>
          <span className="ownerStatusDot" aria-hidden="true" />
          <span>{snapshot.overallStatus === "good" ? "Everything looks good" : "Needs attention"}</span>
        </div>
      </header>

      {snapshot.mode === "seed" ? (
        <div className="ownerDemoNotice">Foundation preview data — not live business data yet</div>
      ) : null}

      <section className="ownerBriefing" aria-labelledby="briefing-title">
        <p className="ownerKicker">{snapshot.periodLabel}</p>
        <h2 id="briefing-title">Here’s what happened.</h2>
        <p className="ownerBriefingText">{snapshot.briefing}</p>
        <div className="ownerMetricGrid">
          {snapshot.metrics.map((metric) => (
            <article key={metric.id} className="ownerMetricCard">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="ownerNeeds" aria-labelledby="needs-title">
        <div className="ownerSectionHeader">
          <div>
            <p className="ownerKicker">Needs you</p>
            <h2 id="needs-title">{snapshot.needsYou.length === 0 ? "Nothing right now" : `${snapshot.needsYou.length} decision${snapshot.needsYou.length === 1 ? "" : "s"}`}</h2>
          </div>
          <span className="ownerNeedsCount">{snapshot.needsYou.length}</span>
        </div>
        {snapshot.needsYou.map((item) => (
          <article className="ownerNeedCard" key={item.id}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
            <button type="button" disabled title="Owner actions will be connected after the live action API is wired.">
              {item.actionLabel}
            </button>
          </article>
        ))}
      </section>

      <div className="ownerColumns">
        <section className="ownerPanel" aria-labelledby="done-title">
          <div className="ownerSectionHeader">
            <div>
              <p className="ownerKicker">Done for you</p>
              <h2 id="done-title">Recent activity</h2>
            </div>
          </div>
          <div className="ownerTimeline">
            {snapshot.doneForYou.map((item) => (
              <article key={item.id} className="ownerTimelineItem">
                <div className="ownerTimelineDot" aria-hidden="true" />
                <div className="ownerTimelineCopy">
                  <div className="ownerTimelineTitleRow">
                    <h3>{item.title}</h3>
                    <time>{formatTime(item.occurredAt)}</time>
                  </div>
                  {item.detail ? <p>{item.detail}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ownerPanel" aria-labelledby="up-next-title">
          <div className="ownerSectionHeader">
            <div>
              <p className="ownerKicker">Up next</p>
              <h2 id="up-next-title">Coming up</h2>
            </div>
          </div>
          <div className="ownerUpcomingList">
            {snapshot.upcoming.map((item) => (
              <article key={item.id} className="ownerUpcomingCard">
                <time>{formatDayTime(item.startsAt)}</time>
                <h3>{item.title}</h3>
                {item.detail ? <p>{item.detail}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="ownerPanel ownerBusinessPanel" aria-labelledby="business-title">
        <div className="ownerSectionHeader">
          <div>
            <p className="ownerKicker">Business</p>
            <h2 id="business-title">Everything in one place</h2>
          </div>
        </div>
        <div className="ownerBusinessGrid">
          {snapshot.businessAreas.map((area) => (
            <button key={area.id} className="ownerBusinessCard" type="button" disabled>
              <div className="ownerBusinessTopline">
                <span className={`ownerAreaDot ownerAreaDot--${area.status}`} aria-hidden="true" />
                <strong>{area.label}</strong>
                {area.needsYou > 0 ? <span className="ownerAreaBadge">{area.needsYou}</span> : null}
              </div>
              <span>{area.summary}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="ownerFooter">
        <nav aria-label="Owner View navigation">
          <span className="ownerNavActive">Home</span>
          <span>Activity</span>
          <span>Business</span>
        </nav>
        <p>Autopilot explains verified business activity in plain language. Technical diagnostics stay hidden unless you open them.</p>
      </footer>
    </main>
  );
}
