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
