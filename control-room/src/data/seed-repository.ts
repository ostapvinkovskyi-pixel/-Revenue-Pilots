import type {
  Approval,
  Event,
  Job,
  Organization,
  Pilot,
} from "../domain";
import {
  getBuilderProgress,
  type BuilderCheckpoint,
} from "../progress";
import type {
  ActiveWorkView,
  ControlRoomRepository,
  ControlRoomSnapshot,
} from "./contracts";

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
    status: "active",
    created_at: "2026-09-10T12:00:00-04:00",
    updated_at: "2026-09-10T17:35:00-04:00",
  },
  {
    pilot_id: "pilot_growth",
    organization_id: organization.organization_id,
    type: "growth",
    status: "active",
    created_at: "2026-09-10T12:00:00-04:00",
    updated_at: "2026-09-10T17:30:00-04:00",
  },
  {
    pilot_id: "pilot_support",
    organization_id: organization.organization_id,
    type: "support",
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
    status: "preview_ready",
    created_at: "2026-09-10T17:20:00-04:00",
    updated_at: "2026-09-10T17:35:00-04:00",
  },
  {
    job_id: "job_inbound_triage",
    organization_id: organization.organization_id,
    pilot_id: "pilot_growth",
    status: "validation_passed",
    created_at: "2026-09-10T16:45:00-04:00",
    updated_at: "2026-09-10T17:28:00-04:00",
  },
];

const workCopy: Record<string, { title: string; detail: string }> = {
  job_control_room_foundation: {
    title: "Control Room foundation",
    detail: "Domain contracts and owner-facing control layer",
  },
  job_inbound_triage: {
    title: "Inbound reply triage",
    detail: "Capture, classify and prepare safe owner actions",
  },
};

function toActiveWork(job: Job): ActiveWorkView {
  const progress = getBuilderProgress(job.status);
  if (progress === undefined) {
    throw new Error(`Job ${job.job_id} has no deterministic progress checkpoint`);
  }

  const copy = workCopy[job.job_id];
  if (!copy) {
    throw new Error(`Missing work copy for ${job.job_id}`);
  }

  return {
    job,
    ...copy,
    progress,
    checkpointLabel: formatCheckpoint(job.status as BuilderCheckpoint),
  };
}

function formatCheckpoint(checkpoint: BuilderCheckpoint): string {
  return checkpoint
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const approval: Approval = {
  approval_id: "approval_control_room_preview",
  organization_id: organization.organization_id,
  job_id: "job_control_room_foundation",
  status: "pending",
  repository: "ostapvinkovskyi-pixel/-Revenue-Pilots",
  pull_request_number: 8,
  commit_sha: "87110cccee988d445861603f50e4227d9dbf26fe",
  preview_url: "https://preview.example.invalid/control-room",
  created_at: "2026-09-10T17:35:00-04:00",
  updated_at: "2026-09-10T17:35:00-04:00",
};

const activity: Event[] = [
  {
    event_id: "evt_preview_ready",
    organization_id: organization.organization_id,
    type: "job_status_changed",
    subject_id: "job_control_room_foundation",
    payload: { status: "preview_ready", label: "Control Room preview prepared" },
    created_at: "2026-09-10T17:35:00-04:00",
  },
  {
    event_id: "evt_approval_requested",
    organization_id: organization.organization_id,
    type: "approval_requested",
    subject_id: "approval_control_room_preview",
    payload: { label: "Owner review requested" },
    created_at: "2026-09-10T17:34:00-04:00",
  },
  {
    event_id: "evt_triage_validation",
    organization_id: organization.organization_id,
    type: "job_status_changed",
    subject_id: "job_inbound_triage",
    payload: { status: "validation_passed", label: "Inbound triage validation passed" },
    created_at: "2026-09-10T17:28:00-04:00",
  },
];

export class SeedControlRoomRepository implements ControlRoomRepository {
  async getSnapshot(): Promise<ControlRoomSnapshot> {
    return {
      organization,
      autopilotStatus: "healthy",
      autopilotMessage: "Core pilots are running. One decision needs you.",
      activeWork: jobs.map(toActiveWork),
      approvals: [
        {
          approval,
          title: "Review Control Room preview",
          detail: "Approval is bound to the exact reviewed commit before production can move.",
        },
      ],
      pilots,
      activity,
      capturedAt: "2026-09-10T17:35:00-04:00",
    };
  }
}
