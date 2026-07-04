import { createPublicClient } from "@/lib/supabase/public";
import type { Review } from "@/lib/types";

/** Published reviews for a teacher, newest first. */
export async function getTeacherReviews(
  teacherId: string,
  limit = 10,
  offset = 0,
): Promise<Review[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, teacher_id, student_id, rating, text, written_at")
    .eq("teacher_id", teacherId)
    .eq("status", 1)
    .order("written_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`reviews fetch failed: ${error.message}`);
  return (data ?? []) as Review[];
}
