// Shared types for cohort project data shapes (used client-side only)

export interface CohortProject {
  id: string;
  title: string;
  description: string | null;
  builder_name: string;
  builder_linkedin: string | null;
  thumbnail_url: string | null;
  video_link: string | null;
  workflow_link: string | null;
  doc_link: string | null;
  hosted_link: string | null;
  project_category: string;
  status: 'draft' | 'published';
  thumbs_up: number;
  thumbs_down: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectSectionAssignment {
  id: string;
  project_id: string;
  section: 'top10' | 'awards' | 'cohort8';
  rank: number;
  award_name: string | null;
  cohort_label: string | null;
}

export const PROJECT_CATEGORIES = [
  'AI Tools',
  'Product',
  'Analytics',
  'Design',
  'Automation',
  'Research',
] as const;
