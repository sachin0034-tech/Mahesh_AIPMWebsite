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
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function getPublishedProjects(section?: string) {
  const url = section ? `${BASE}/cohort-projects?section=${section}` : `${BASE}/cohort-projects`;
  const res = await fetch(url);
  return json<{ success: boolean; data: any[] }>(res);
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
