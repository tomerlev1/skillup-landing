// Domain types for the SkillUp web marketplace. Shapes mirror the Supabase
// schema (teachers_public view, search_teachers_public RPC, taxonomy tables) —
// snake_case is kept as-is so PostgREST rows type directly with no mapping.

export type LessonMode = "online" | "teacher_home" | "student_home";

export interface TeacherCard {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  card_image_url: string | null;
  video_url: string | null;
  hourly_rate: number | null;
  lesson_mode_prices: Partial<Record<string, number>> | null;
  lesson_modes: LessonMode[] | null;
  city_id: string | null;
  city_name: string | null;
  experience_years: number | null;
  total_students: number | null;
  education: string[] | null;
  languages: string[] | null;
  is_verified: boolean;
  is_subscribed: boolean;
  subscription_tier: string | null;
  created_at: string;
  rating_avg: number;
  review_count: number;
  subjects: string[];
}

export interface SearchResult {
  items: TeacherCard[];
  total: number;
}

export type SortOption =
  | "rating"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "reviews";

export interface SearchParams {
  query?: string;
  cityId?: string;
  categoryId?: string;
  subjectIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  modes?: LessonMode[];
  sort?: SortOption;
  limit?: number;
  offset?: number;
}

// Full public profile — the teachers_public view row (all columns anon-safe).
export interface TeacherProfile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  video_url: string | null;
  hourly_rate: number | null;
  experience_years: number | null;
  total_students: number | null;
  is_verified: boolean;
  is_active: boolean;
  is_subscribed: boolean;
  subscription_tier: string | null;
  lesson_modes: LessonMode[] | null;
  timezone: string | null;
  teaching_style: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  region_id: string | null;
  city_id: string | null;
  education: string[] | null;
  languages: string[] | null;
  lesson_mode_prices: Partial<Record<string, number>> | null;
  background_url: string | null;
  default_lesson_duration_minutes: number | null;
  card_image_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
}

export interface Category {
  id: string;
  name_he: string;
  name_en: string;
  description_he: string | null;
  icon_name: string | null;
  color_hex: string | null;
  sort_order: number | null;
}

export interface Subject {
  id: string;
  name_he: string;
  name: string | null;
  category_id: string;
  icon: string | null;
}

export interface City {
  id: string;
  name_he: string;
  name_en: string | null;
  sort_order: number | null;
}

export interface Review {
  id: string;
  teacher_id: string;
  student_id: string;
  rating: number;
  text: string | null;
  written_at: string;
}

export interface AvailabilitySlot {
  id: string;
  teacher_id: string;
  start_at: string;
  end_at: string;
  is_booked: boolean;
  allowed_modes: LessonMode[] | null;
}

export type UserRole = "student" | "teacher";

export interface SessionProfile {
  userId: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
}
