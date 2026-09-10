import type { Approval, Event, Job, Organization, Pilot } from "../domain";

export interface ActiveWorkView {
  job: Job;
  title: string;
  detail: string;
  /** Derived from the deterministic checkpoint map, never persisted or AI-guessed. */
  progress: number;
  checkpointLabel: string;
}

export interface ApprovalView {
  approval: Approval;
  title: string;
  detail: string;
}

export interface ControlRoomSnapshot {
  mode: "seed" | "live";
  organization: Organization;
  autopilotStatus: "healthy" | "attention" | "offline";
  autopilotMessage: string;
  activeWork: ActiveWorkView[];
  approvals: ApprovalView[];
  pilots: Pilot[];
  activity: Event[];
  capturedAt: string;
}

/**
 * Provider-neutral boundary consumed by the UI.
 * The seed adapter can be replaced with Supabase/realtime without changing screens.
 */
export interface ControlRoomRepository {
  getSnapshot(): Promise<ControlRoomSnapshot>;
}
