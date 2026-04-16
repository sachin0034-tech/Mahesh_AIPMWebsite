// All cohort project API calls go through the Express server.
// Admin token is stored in localStorage after login.

const BASE = '/api';

export const cohortAdminToken = {
  get: () => localStorage.getItem('cohort_admin_token'),
  set: (t: string) => localStorage.setItem('cohort_admin_token', t),
  clear: () => localStorage.removeItem('cohort_admin_token'),
};

function authHeaders(): HeadersInit {
  const token = cohortAdminToken.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function json<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status}): please try again or contact support`);
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function getPublishedProjects(section?: string) {
  const url = section ? `${BASE}/cohort-projects?section=${section}` : `${BASE}/cohort-projects`;
  const res = await fetch(url);
  return json<{ success: boolean; data: any[] }>(res);
}

export async function getProjectById(id: string) {
  const res = await fetch(`${BASE}/cohort-projects/${id}`);
  return json<{ success: boolean; data: any }>(res);
}

export async function voteOnProject(projectId: string, vote_type: 'up' | 'down', voter_id: string) {
  const res = await fetch(`${BASE}/cohort-projects/${projectId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote_type, voter_id }),
  });
  return json<{ success: boolean }>(res);
}

// ── Admin auth ────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/cohort-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return json<{ success: boolean; token: string }>(res);
}

export async function adminLogout() {
  await fetch(`${BASE}/cohort-admin/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  cohortAdminToken.clear();
}

// ── Admin projects ────────────────────────────────────────────────────────────

export async function adminGetProjects() {
  const res = await fetch(`${BASE}/cohort-admin/projects`, {
    headers: { ...authHeaders() },
  });
  return json<{ success: boolean; data: any[] }>(res);
}

export async function adminCreateProject(payload: any) {
  const res = await fetch(`${BASE}/cohort-admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return json<{ success: boolean; data: any }>(res);
}

export async function adminUpdateProject(id: string, payload: any) {
  const res = await fetch(`${BASE}/cohort-admin/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return json<{ success: boolean }>(res);
}

export async function adminSetStatus(id: string, status: 'published' | 'draft') {
  const res = await fetch(`${BASE}/cohort-admin/projects/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return json<{ success: boolean }>(res);
}

export async function adminDeleteProject(id: string) {
  const res = await fetch(`${BASE}/cohort-admin/projects/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return json<{ success: boolean }>(res);
}

export async function adminUploadThumbnail(file: File): Promise<string> {
  const form = new FormData();
  form.append('thumbnail', file);
  const res = await fetch(`${BASE}/cohort-admin/upload-thumbnail`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  const data = await json<{ success: boolean; url: string }>(res);
  return data.url;
}

export async function adminUploadUserImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('user_image', file);
  const res = await fetch(`${BASE}/cohort-admin/upload-user-image`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  const data = await json<{ success: boolean; url: string }>(res);
  return data.url;
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  bio: string | null;
  post_text: string;
  image_url: string | null;   // author profile photo
  media_url: string | null;   // image/video attached to the post
  post_date: string | null;   // "YYYY-MM-DD" from LinkedIn
  source_url: string;
  is_starred: boolean;
  created_at: string;
}

/** Public — no auth needed, returns starred-first */
export async function getTestimonials() {
  const res = await fetch(`${BASE}/cohort-admin/testimonials`);
  return json<{ success: boolean; data: Testimonial[] }>(res);
}

/** Admin — scrape a LinkedIn URL and persist; idempotent on duplicate URL */
export async function adminScrapeTestimonial(url: string) {
  const res = await fetch(`${BASE}/cohort-admin/testimonials/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ url }),
  });
  return json<{ success: boolean; data: Testimonial; cached: boolean }>(res);
}

export async function adminToggleTestimonialStar(id: string, is_starred: boolean) {
  const res = await fetch(`${BASE}/cohort-admin/testimonials/${id}/star`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ is_starred }),
  });
  return json<{ success: boolean }>(res);
}

export async function adminDeleteTestimonial(id: string) {
  const res = await fetch(`${BASE}/cohort-admin/testimonials/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return json<{ success: boolean }>(res);
}

/** Admin — create a custom (non-LinkedIn) testimonial with optional image upload */
export async function adminCreateCustomTestimonial(formData: FormData) {
  const res = await fetch(`${BASE}/cohort-admin/testimonials/custom`, {
    method: 'POST',
    headers: { ...authHeaders() }, // no Content-Type — let browser set multipart boundary
    body: formData,
  });
  return json<{ success: boolean; data: Testimonial }>(res);
}
