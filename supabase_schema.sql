-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- ── Main projects table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohort_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  builder_name TEXT NOT NULL,
  builder_linkedin TEXT,
  thumbnail_url TEXT,
  video_link TEXT,
  workflow_link TEXT,
  doc_link TEXT,
  hosted_link TEXT,
  project_category TEXT DEFAULT 'AI Tools',
  status TEXT DEFAULT 'draft',   -- 'draft' | 'published'
  thumbs_up INT DEFAULT 0,
  thumbs_down INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Section assignments (project can be in multiple sections) ────────────────
CREATE TABLE IF NOT EXISTS project_section_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES cohort_projects(id) ON DELETE CASCADE,
  section TEXT NOT NULL,          -- 'top10' | 'awards' | 'cohort8'
  rank INT DEFAULT 999,
  award_name TEXT,                -- for awards: 'Best AI Tool' etc.
  cohort_label TEXT,              -- for cohort8: 'Cohort 8'
  UNIQUE(project_id, section)
);

-- ── Feedback (one vote per anonymous user per project) ───────────────────────
CREATE TABLE IF NOT EXISTS project_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES cohort_projects(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL,        -- 'up' | 'down'
  voter_id TEXT NOT NULL,         -- anonymous UUID stored in localStorage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, voter_id)
);

-- ── RLS: allow all (public community showcase) ───────────────────────────────
ALTER TABLE cohort_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON cohort_projects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE project_section_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON project_section_assignments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE project_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON project_feedback FOR ALL USING (true) WITH CHECK (true);

-- ── Storage bucket for thumbnails ────────────────────────────────────────────
-- Run this separately in Supabase Storage or via the dashboard:
-- Create a public bucket named: project-thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('project-thumbnails', 'project-thumbnails', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public_read" ON storage.objects FOR SELECT USING (bucket_id = 'project-thumbnails');
CREATE POLICY "public_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-thumbnails');
CREATE POLICY "public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-thumbnails');

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Project User System + Rich Project Editor Fields
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── New columns on cohort_projects ───────────────────────────────────────────
ALTER TABLE cohort_projects
  ADD COLUMN IF NOT EXISTS banner_url             TEXT,
  ADD COLUMN IF NOT EXISTS user_image_url         TEXT,
  ADD COLUMN IF NOT EXISTS what_you_learned       TEXT,
  ADD COLUMN IF NOT EXISTS about_user_description TEXT,
  ADD COLUMN IF NOT EXISTS whats_included         JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visibility_flags       JSONB DEFAULT '{
    "description": true,
    "banner": true,
    "user_image": true,
    "what_you_learned": true,
    "about_user": true,
    "whats_included": true,
    "video_link": true,
    "demo_link": true,
    "doc_link": true
  }'::jsonb;

-- ── Project users (admin-created credentials) ────────────────────────────────
CREATE TABLE IF NOT EXISTS project_users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username      TEXT        NOT NULL UNIQUE,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access_users" ON project_users FOR ALL USING (false);

-- ── Per-user project permissions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_user_permissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES project_users(id)   ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES cohort_projects(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id)
);

ALTER TABLE project_user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access_perms" ON project_user_permissions FOR ALL USING (false);

-- ── Storage bucket for banners and user photos ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public_read_assets"   ON storage.objects FOR SELECT  USING     (bucket_id = 'project-assets');
CREATE POLICY "public_upload_assets" ON storage.objects FOR INSERT  WITH CHECK (bucket_id = 'project-assets');
CREATE POLICY "public_delete_assets" ON storage.objects FOR DELETE  USING     (bucket_id = 'project-assets');
