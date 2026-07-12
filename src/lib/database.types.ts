// Hand-written subset of the Supabase schema this app touches.
// Source of truth: storyplugs-supabase/supabase/migrations/*.sql

export type ContentStatus = "draft" | "pending_review" | "approved" | "published" | "archived";
export type ContentSource = "manual" | "ai_generated";
export type AdminRole = "editor" | "super_admin";
export type NotificationTargetType = "all" | "user" | "selected";
export type ReportTargetType = "story" | "comment" | "user";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  notification_time: string;
  notification_types: string[];
  push_token: string | null;
  gender: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminRow {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  audio_url: string | null;
  category: string;
  reflection_question: string | null;
  daily_lesson: string | null;
  source: ContentSource;
  status: ContentStatus;
  is_featured: boolean;
  is_pinned: boolean;
  is_mature: boolean;
  generated_by_admin_id: string | null;
  approved_by_admin_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryChapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  body: string;
  created_at: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
}

export interface Reflection {
  id: string;
  text: string;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_user_id: string | null;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  target_type: NotificationTargetType;
  target_user_id: string | null;
  story_id: string | null;
  created_by_admin_id: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  story_id: string;
  created_at: string;
}

export interface StoryView {
  id: string;
  user_id: string | null;
  story_id: string;
  completed: boolean;
  listened_audio: boolean;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  updated_at: string;
}
