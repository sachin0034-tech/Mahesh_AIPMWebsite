// Shared types for cohort project data shapes (used client-side only)

export interface VisibilityFlags {
  description: boolean;
  banner: boolean;
  user_image: boolean;
  what_you_learned: boolean;
  about_user: boolean;
  whats_included: boolean;
  video_link: boolean;
  demo_link: boolean;
  doc_link: boolean;
}

export const DEFAULT_VISIBILITY_FLAGS: VisibilityFlags = {
  description: true,
  banner: true,
  user_image: true,
  what_you_learned: true,
  about_user: true,
  whats_included: true,
  video_link: true,
  demo_link: true,
  doc_link: true,
};

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
  // Rich editor fields
  banner_url: string | null;
  user_image_url: string | null;
  what_you_learned: string | null;
  about_user_description: string | null;
  whats_included: string[] | null;
  visibility_flags: VisibilityFlags | null;
}

export interface ProjectUser {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}

export interface ProjectUserWithProjects extends ProjectUser {
  projects: Array<{ id: string; title: string }>;
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
