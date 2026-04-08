// API calls for project users (builders editing their own projects)

const BASE = '/api';

export const projectUserToken = {
  get: () => localStorage.getItem('project_user_token'),
  set: (t: string) => localStorage.setItem('project_user_token', t),
  clear: () => localStorage.removeItem('project_user_token'),
};

function authHeaders(): HeadersInit {
  const token = projectUserToken.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function projectUserLogin(username: string, password: string) {
  const res = await fetch(`${BASE}/project-user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return json<{ success: boolean; token: string; user: { id: string; username: string; email: string } }>(res);
}

export async function projectUserLogout() {
  await fetch(`${BASE}/project-user/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  projectUserToken.clear();
}

// ── My Projects ───────────────────────────────────────────────────────────────

export async function getMyProjects() {
  const res = await fetch(`${BASE}/project-user/me`, {
    headers: { ...authHeaders() },
  });
  return json<{ success: boolean; user: any; projects: any[] }>(res);
}

export async function getMyProject(id: string) {
  const res = await fetch(`${BASE}/project-user/projects/${id}`, {
    headers: { ...authHeaders() },
  });
  return json<{ success: boolean; data: any }>(res);
}

export async function updateMyProject(id: string, payload: Record<string, any>) {
  const res = await fetch(`${BASE}/project-user/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return json<{ success: boolean }>(res);
}

export async function publishMyProject(id: string) {
  const res = await fetch(`${BASE}/project-user/projects/${id}/publish`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  return json<{ success: boolean }>(res);
}

export async function uploadProjectAsset(file: File, type: 'banner' | 'user_image'): Promise<string> {
  const form = new FormData();
  form.append('asset', file);
  const res = await fetch(`${BASE}/project-user/upload-asset?type=${type}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  const data = await json<{ success: boolean; url: string }>(res);
  return data.url;
}

// ── Admin: Project User Management ───────────────────────────────────────────
// These use the cohort admin token

function adminHeaders(): HeadersInit {
  const token = localStorage.getItem('cohort_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminGetProjectUsers() {
  const res = await fetch(`${BASE}/cohort-admin/project-users`, {
    headers: { ...adminHeaders() },
  });
  return json<{ success: boolean; data: any[] }>(res);
}

export async function adminCreateProjectUser(payload: {
  username: string; email: string; password: string; projectIds: string[];
}) {
  const res = await fetch(`${BASE}/cohort-admin/project-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders() },
    body: JSON.stringify(payload),
  });
  return json<{ success: boolean; data: any }>(res);
}

export async function adminDeleteProjectUser(userId: string) {
  const res = await fetch(`${BASE}/cohort-admin/project-users/${userId}`, {
    method: 'DELETE',
    headers: { ...adminHeaders() },
  });
  return json<{ success: boolean }>(res);
}

export async function adminUpdateProjectUserProjects(userId: string, projectIds: string[]) {
  const res = await fetch(`${BASE}/cohort-admin/project-users/${userId}/projects`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...adminHeaders() },
    body: JSON.stringify({ projectIds }),
  });
  return json<{ success: boolean }>(res);
}
