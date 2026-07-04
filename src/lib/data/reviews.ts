import { createPublicClient } from "@/lib/supabase/public";

export interface PublicReview {
  id: string;
  rating: number;
  text: string | null;
  written_at: string;
  reviewer_name: string;
}

/**
 * Published reviews for a teacher, with the reviewer's FIRST name (anon-safe
 * RPC — no other student PII is exposed). Falls back to "תלמיד/ה".
 */
export async function getTeacherReviews(
  teacherId: string,
  limit = 10,
  offset = 0,
): Promise<PublicReview[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_teacher_reviews_public", {
    p_teacher_id: teacherId,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw new Error(`reviews fetch failed: ${error.message}`);
  return (data ?? []) as PublicReview[];
}
