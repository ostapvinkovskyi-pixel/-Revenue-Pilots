// Control Room Builder progress contract — Phase 1A
// Deterministic checkpoint map only. No freeform/AI-derived percentages.

export const BUILDER_CHECKPOINTS = {
  received: 5,
  requirements_complete: 15,
  queued: 20,
  build_started: 30,
  code_complete: 60,
  validation_passed: 72,
  preview_ready: 82,
  qa_passed: 92,
  owner_approved: 97,
  production_live: 100,
} as const;

export type BuilderCheckpoint = keyof typeof BUILDER_CHECKPOINTS;

export type BuilderCheckpointProgress = typeof BUILDER_CHECKPOINTS[BuilderCheckpoint];

export function isBuilderCheckpoint(value: string): value is BuilderCheckpoint {
  return Object.prototype.hasOwnProperty.call(BUILDER_CHECKPOINTS, value);
}

export function getBuilderProgress(
  checkpoint: string,
): BuilderCheckpointProgress | undefined {
  if (!isBuilderCheckpoint(checkpoint)) {
    return undefined;
  }
  return BUILDER_CHECKPOINTS[checkpoint];
}

export function requireBuilderProgress(
  checkpoint: BuilderCheckpoint,
): BuilderCheckpointProgress {
  return BUILDER_CHECKPOINTS[checkpoint];
}
