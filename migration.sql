-- ── Migration: Project User System + Rich Editor Fields ──────────────────────
-- Run ONLY this file in Supabase SQL Editor (not the full supabase_schema.sql)

ALTER TABLE cohort_projects
  ADD COLUMN IF NOT EXISTS banner_url             TEXT,
  ADD COLUMN IF NOT EXISTS user_image_url         TEXT,
  ADD COLUMN IF NOT EXISTS what_you_learned       TEXT,
  ADD COLUMN IF NOT EXISTS about_user_description TEXT,
  ADD COLUMN IF NOT EXISTS whats_included         JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visibility_flags       JSONB DEFAULT '{"description":true,"banner":true,"user_image":true,"what_you_learned":true,"about_user":true,"whats_included":true,"video_link":true,"demo_link":true,"doc_link":true}'::jsonb;

CREATE TABLE IF NOT EXISTS project_users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username      TEXT        NOT NULL UNIQUE,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_user_permissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES project_users(id)   ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES cohort_projects(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id)
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT DO NOTHING;

-- ── Migration: Testimonials Table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  bio        TEXT,
  post_text  TEXT        NOT NULL,
  image_url  TEXT,
  media_url  TEXT,
  post_date  DATE,
  source_url TEXT        NOT NULL UNIQUE,
  is_starred BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
