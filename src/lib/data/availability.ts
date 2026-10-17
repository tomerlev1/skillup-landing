import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import type { AvailabilitySlot } from "@/lib/types";

/** Upcoming open slots for a teacher (RLS exposes only is_booked = false). */
export async function getUpcomingSlots(
  teacherId: string,
  limit = 24,
): Promise<AvailabilitySlot[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, teacher_id, start_at, end_at, is_booked, allowed_modes")
    .eq("teacher_id", teacherId)
    .eq("is_booked", false)
    .gt("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`availability_slots fetch failed: ${error.message}`);
  return (data ?? []) as AvailabilitySlot[];
}

/** Earliest open slot in the next 7 days per teacher, in one query. Never throws. */
export async function fetchNextSlots(
  supabase: SupabaseClient,
  teacherIds: string[],
  now: Date = new Date(),
): Promise<Record<string, AvailabilitySlot>> {
  if (teacherIds.length === 0) return {};
  const until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, teacher_id, start_at, end_at, is_booked, allowed_modes")
    .in("teacher_id", teacherIds)
    .eq("is_booked", false)
    .gte("start_at", now.toISOString())
    .lt("start_at", until.toISOString())
    .order("start_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error(`availability_slots next-slot fetch failed: ${error.message}`);
    return {};
  }
  const result: Record<string, AvailabilitySlot> = {};
  for (const slot of (data ?? []) as AvailabilitySlot[]) {
    if (!result[slot.teacher_id]) result[slot.teacher_id] = slot;
  }
  return result;
}

/** Server wrapper around fetchNextSlots using the public client. */
export async function getNextSlots(
  teacherIds: string[],
): Promise<Record<string, AvailabilitySlot>> {
  return fetchNextSlots(createPublicClient(), teacherIds);
}
