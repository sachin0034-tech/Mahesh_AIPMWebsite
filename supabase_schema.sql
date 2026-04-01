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
