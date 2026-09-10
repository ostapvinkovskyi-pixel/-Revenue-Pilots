import type { Approval, Event, Job, Organization, Pilot } from "../domain";
import { getBuilderProgress, type BuilderCheckpoint } from "../progress";
import type { ActiveWorkView, ControlRoomRepository, ControlRoomSnapshot } from "./contracts";

const organization: Organization = {
  organization_id: "org_revenue_pilots_internal",
  name: "Revenue Pilots",
  status: "active",
  created_at: "2026-09-10T12:00:00-04:00",
  updated_at: "2026-09-10T17:35:00-04:00",
};

const pilots: Pilot[] = [
  {
    pilot_id: "pilot_builder",
    organization_id: organization.organization_id,
    type: "builder",
    display_name: "Builder Pilot",
    status: "active",
    created_at: "2026-09-10T12:00:00-04:00",
    updated_at: "2026-09-10T17:35:00-04:00",
  },
  {
    pilot_id: "pilot_communication",
    organization_id: organization.organization_id,
    type: "communication",
    display_name: "Communication Pilot",
    status: "active",
    created_at: "2026-09-10T12:00:00-04:00",
    updated_at: "2026-09-10T17:30:00-04:00",
  },
  {
    pilot_id: "pilot_watchdog",
    organization_id: organization.organization_id,
    type: "watchdog",
    display_name: "Watchdog",
    status: "paused",
    created_at: "2026-09-10T12:00:00-04:00",
    updated_at: "2026-09-10T17:20:00-04:00",
  },
];

const jobs: Job[] = [
  {
    job_id: "job_control_room_foundation",
    organization_id: organization.organization_id,
    pilot_id: "pilot_builder",
    external_job_id: "CONTROL-ROOM-FOUNDATION-003",
    title: "Control Room foundation",
    summary: "Domain contracts and owner-facing control layer",
    status: "preview_ready",
    created_at: "2026-09-10T17:20:00-04:00",
    updated_at: "2026-09-10T17:35:00-04:00",
  },
  {
    job_id: "job_inbound_triage",
    organization_id: organization.organization_id,
    pilot_id: "pilot_communication",
    title: "Inbound reply triage",
    summary: "Capture, classify and prepare safe owner actions",
    status: "validation_passed",
    created_at: "2026-09-10T16:45:00-04:00",
    updated_at: "2026-09-10T17:28:00-04:00",
  },
];

function formatCheckpoint(checkpoint: BuilderCheckpoint): string {
  return checkpoint
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toActiveWork(job: Job): ActiveWorkView {
  const progress = getBuilderProgress(job.status);
  if (progress === undefined) {
    throw new Error(`Job ${job.job_id} has no deterministic progress checkpoint`);
  }

  return {
    job,
    title: job.title,
    detail: job.summary ?? "",
    progress,
    checkpointLabel: formatCheckpoint(job.status as BuilderCheckpoint),
  };
}

const approval: Approval = {
  approval_id: "approval_seed_preview",
  organization_id: organization.organization_id,
  job_id: "job_control_room_foundation",
  status: "pending",
  action: "production_deploy",
  repository: "seed/example-repository",
  pull_request_number: 8,
  commit_sha: "seed000000000000000000000000000000000000",
  preview_url: "https://preview.example.invalid/control-room",
  requested_at: "2026-09-10T17:35:00-04:00",
  created_at: "2026-09-10T17:35:00-04:00",
  updated_at: "2026-09-10T17:35:00-04:00",
};

const activity: Event[] = [
  {
    event_id: "evt_preview_ready",
    organization_id: organization.organization_id,
    type: "job_status_changed",
    subject_type: "job",
    subject_id: "job_control_room_foundation",
    source: "seed",
    payload: { status: "preview_ready", label: "Control Room preview prepared" },
    created_at: "2026-09-10T17:35:00-04:00",
  },
  {
    event_id: "evt_approval_requested",
    organization_id: organization.organization_id,
    type: "approval_requested",
    subject_type: "approval",
    subject_id: "approval_seed_preview",
    source: "seed",
    payload: { label: "Owner review requested" },
    created_at: "2026-09-10T17:34:00-04:00",
  },
  {
    event_id: "evt_triage_validation",
    organization_id: organization.organization_id,
    type: "job_status_changed",
    subject_type: "job",
    subject_id: "job_inbound_triage",
    source: "seed",
    payload: { status: "validation_passed", label: "Inbound triage validation passed" },
    created_at: "2026-09-10T17:28:00-04:00",
  },
];

export class SeedControlRoomRepository implements ControlRoomRepository {
  async getSnapshot(): Promise<ControlRoomSnapshot> {
    return {
      mode: "seed",
      organization,
      autopilotStatus: "healthy",
      autopilotMessage: "Core pilots are running. One decision needs you.",
      activeWork: jobs.map(toActiveWork),
      approvals: [
        {
          approval,
          title: "Review exact deployment target",
          detail: "Seed example: production approval stays bound to one reviewed commit.",
        },
      ],
      pilots,
      activity,
      capturedAt: "2026-09-10T17:35:00-04:00",
    };
  }
}
