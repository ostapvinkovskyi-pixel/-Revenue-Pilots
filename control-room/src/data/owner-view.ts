export type OwnerAreaId = "email" | "leads" | "calendar" | "payments" | "website";

export interface OwnerMetric {
  id: string;
  label: string;
  value: number | string;
  detail?: string;
}

export interface OwnerActionItem {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  area: OwnerAreaId;
  sourceId: string;
}

export interface OwnerActivityItem {
  id: string;
  title: string;
  detail?: string;
  occurredAt: string;
  area: OwnerAreaId;
  sourceId: string;
}

export interface OwnerUpcomingItem {
  id: string;
  title: string;
  detail?: string;
  startsAt: string;
  area: OwnerAreaId;
  sourceId: string;
}

export interface OwnerBusinessArea {
  id: OwnerAreaId;
  label: string;
  status: "good" | "attention" | "quiet";
  summary: string;
  needsYou: number;
}

export interface OwnerViewSnapshot {
  mode: "seed" | "live";
  ownerName: string;
  companyName: string;
  periodLabel: string;
  overallStatus: "good" | "attention" | "offline";
  briefing: string;
  metrics: OwnerMetric[];
  needsYou: OwnerActionItem[];
  doneForYou: OwnerActivityItem[];
  upcoming: OwnerUpcomingItem[];
  businessAreas: OwnerBusinessArea[];
  capturedAt: string;
}

/**
 * Temporary seed snapshot for product shaping only.
 * Live mode will be assembled from verified normalized events/state.
 */
export function getSeedOwnerViewSnapshot(): OwnerViewSnapshot {
  return {
    mode: "seed",
    ownerName: "John",
    companyName: "Example Roofing",
    periodLabel: "Today",
    overallStatus: "good",
    briefing:
      "Everything is running normally. Autopilot handled customer communication, moved follow-ups forward, and kept your schedule organized. One item needs your decision.",
    metrics: [
      { id: "messages", label: "Messages handled", value: 14 },
      { id: "leads", label: "Leads followed up", value: 3 },
      { id: "bookings", label: "Appointments booked", value: 2 },
      { id: "payments", label: "Payments received", value: 1 },
    ],
    needsYou: [
      {
        id: "need-1",
        title: "Sarah asked for custom pricing",
        detail: "Autopilot paused before quoting because this needs your decision.",
        actionLabel: "Review",
        area: "leads",
        sourceId: "seed-lead-sarah",
      },
    ],
    doneForYou: [
      {
        id: "done-1",
        title: "Replied to Michael about availability",
        detail: "Available estimate times were sent.",
        occurredAt: "2026-09-10T14:41:00-04:00",
        area: "email",
        sourceId: "seed-email-michael",
      },
      {
        id: "done-2",
        title: "Booked Friday estimate",
        detail: "The appointment was added to the calendar.",
        occurredAt: "2026-09-10T14:35:00-04:00",
        area: "calendar",
        sourceId: "seed-calendar-friday",
      },
      {
        id: "done-3",
        title: "Followed up with James",
        detail: "No response after the first message, so the scheduled follow-up was sent.",
        occurredAt: "2026-09-10T13:58:00-04:00",
        area: "leads",
        sourceId: "seed-lead-james",
      },
    ],
    upcoming: [
      {
        id: "up-1",
        title: "Roof estimate with Michael Torres",
        detail: "Confirmed appointment",
        startsAt: "2026-09-10T16:30:00-04:00",
        area: "calendar",
        sourceId: "seed-calendar-michael",
      },
      {
        id: "up-2",
        title: "Carter Homes follow-up",
        detail: "Scheduled follow-up if there is still no reply",
        startsAt: "2026-09-11T09:00:00-04:00",
        area: "leads",
        sourceId: "seed-lead-carter",
      },
    ],
    businessAreas: [
      { id: "email", label: "Email", status: "good", summary: "11 handled automatically", needsYou: 0 },
      { id: "leads", label: "Leads", status: "attention", summary: "3 moved forward", needsYou: 1 },
      { id: "calendar", label: "Calendar", status: "good", summary: "2 appointments booked", needsYou: 0 },
      { id: "payments", label: "Payments", status: "good", summary: "1 received", needsYou: 0 },
      { id: "website", label: "Website", status: "quiet", summary: "No action needed", needsYou: 0 },
    ],
    capturedAt: "2026-09-10T15:00:00-04:00",
  };
}
