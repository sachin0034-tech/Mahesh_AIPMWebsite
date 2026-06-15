-- Azure PostgreSQL Schema
-- Run this against your Azure Database for PostgreSQL instance.
-- No RLS, no Supabase-specific policies.
-- Requires PostgreSQL 13+ for gen_random_uuid() (pgcrypto extension or pg_catalog).

-- Enable UUID generation (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Main projects table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohort_projects (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title                TEXT        NOT NULL,
  description          TEXT,
  builder_name         TEXT        NOT NULL,
  builder_linkedin     TEXT,
  thumbnail_url        TEXT,
  user_image_url       TEXT,
  banner_url           TEXT,
  video_link           TEXT,
  workflow_link        TEXT,
  doc_link             TEXT,
  hosted_link          TEXT,
  project_category     TEXT        DEFAULT 'AI Tools',
  status               TEXT        DEFAULT 'draft',   -- 'draft' | 'published'
  thumbs_up            INT         DEFAULT 0,
  thumbs_down          INT         DEFAULT 0,
  what_you_learned     TEXT,
  about_user_description TEXT,
  whats_included       JSONB       DEFAULT '[]'::jsonb,
  visibility_flags     JSONB       DEFAULT '{
    "description": true,
    "banner": true,
    "user_image": true,
    "what_you_learned": true,
    "about_user": true,
    "whats_included": true,
    "video_link": true,
    "demo_link": true,
    "doc_link": true
  }'::jsonb,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Section assignments (project can be in multiple sections) ────────────────
CREATE TABLE IF NOT EXISTS project_section_assignments (
  id           UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id   UUID  REFERENCES cohort_projects(id) ON DELETE CASCADE,
  section      TEXT  NOT NULL,          -- 'top10' | 'awards' | 'cohort8'
  rank         INT   DEFAULT 999,
  award_name   TEXT,                    -- for awards: 'Best AI Tool' etc.
  cohort_label TEXT,                    -- for cohort8: 'Cohort 8'
  UNIQUE(project_id, section)
);

-- ── Feedback (one vote per anonymous user per project) ───────────────────────
CREATE TABLE IF NOT EXISTS project_feedback (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID        REFERENCES cohort_projects(id) ON DELETE CASCADE,
  vote_type  TEXT        NOT NULL,        -- 'up' | 'down'
  voter_id   TEXT        NOT NULL,        -- anonymous UUID stored in localStorage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, voter_id)
);

-- ── Project users (admin-created credentials) ────────────────────────────────
CREATE TABLE IF NOT EXISTS project_users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username      TEXT        NOT NULL UNIQUE,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Per-user project permissions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_user_permissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES project_users(id)   ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES cohort_projects(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id)
);

-- ── Testimonials ──────────────────────────────────────────────────────────────
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
