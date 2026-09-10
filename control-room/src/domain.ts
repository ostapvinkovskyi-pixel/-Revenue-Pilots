// Control Room domain contracts.
// These types describe normalized product state, not provider-specific payloads.

export type ISODateTimeString = string;

export type OrganizationStatus = "active" | "suspended" | "archived";

export interface Organization {
  organization_id: string;
  name: string;
  status: OrganizationStatus;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type MembershipRole = "owner" | "admin" | "member" | "viewer";
export type MembershipStatus = "invited" | "active" | "suspended" | "removed";

export interface Membership {
  membership_id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type PilotType =
  | "dispatcher"
  | "intake"
  | "communication"
  | "meeting"
  | "payment"
  | "builder"
  | "systems"
  | "watchdog"
  | "growth"
  | "support"
  | "custom";

export type PilotStatus = "active" | "paused" | "disabled";

export interface Pilot {
  pilot_id: string;
  organization_id: string;
  type: PilotType;
  display_name: string;
  status: PilotStatus;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type JobStatus =
  | "received"
  | "requirements_complete"
  | "queued"
  | "build_started"
  | "code_complete"
  | "validation_passed"
  | "preview_ready"
  | "qa_passed"
  | "owner_approved"
  | "production_live"
  | "blocked"
  | "failed"
  | "cancelled";

export interface Job {
  job_id: string;
  organization_id: string;
  pilot_id: string | null;
  external_job_id?: string | null;
  title: string;
  summary?: string | null;
  status: JobStatus;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type JobStepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "skipped";

export interface JobStep {
  job_step_id: string;
  job_id: string;
  organization_id: string;
  name: string;
  status: JobStepStatus;
  started_at?: ISODateTimeString | null;
  completed_at?: ISODateTimeString | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type EventType =
  | "job_status_changed"
  | "job_step_status_changed"
  | "approval_requested"
  | "approval_decided"
  | "connection_status_changed"
  | "support_grant_status_changed"
  | "system_health_changed"
  | "inbound_captured";

export interface Event {
  event_id: string;
  organization_id: string;
  type: EventType;
  subject_type: string;
  subject_id: string;
  payload: Record<string, unknown>;
  source?: string | null;
  created_at: ISODateTimeString;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface Approval {
  approval_id: string;
  organization_id: string;
  job_id: string;
  status: ApprovalStatus;
  action: string;
  repository: string;
  pull_request_number: number;
  commit_sha: string;
  preview_url: string;
  requested_at: ISODateTimeString;
  decided_by?: string | null;
  decided_at?: ISODateTimeString | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type ConnectionProvider =
  | "make"
  | "github"
  | "vercel"
  | "stripe"
  | "google"
  | "gmail"
  | "google_calendar"
  | "supabase"
  | "other";

export type ConnectionStatus = "connected" | "disconnected" | "error" | "revoked";

export interface Connection {
  connection_id: string;
  organization_id: string;
  provider: ConnectionProvider;
  status: ConnectionStatus;
  account_label: string;
  metadata: Record<string, string | number | boolean | null>;
  last_checked_at?: ISODateTimeString | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export type SupportGrantStatus = "active" | "expired" | "revoked";

export interface SupportGrant {
  support_grant_id: string;
  organization_id: string;
  granted_to_user_id: string;
  granted_by_user_id: string;
  status: SupportGrantStatus;
  scopes: string[];
  reason?: string | null;
  expires_at: ISODateTimeString;
  revoked_at?: ISODateTimeString | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}
