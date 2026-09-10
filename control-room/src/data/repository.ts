import type { ControlRoomRepository } from "./contracts";
import { SeedControlRoomRepository } from "./seed-repository";

/**
 * Single composition point for the data layer.
 * Replace this adapter with a Supabase implementation when realtime persistence is wired.
 */
export function getControlRoomRepository(): ControlRoomRepository {
  return new SeedControlRoomRepository();
}
