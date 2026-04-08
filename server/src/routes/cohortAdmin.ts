import { Router } from 'express';
import multer from 'multer';
import { hash as bcryptHash } from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateToken, revokeToken } from '../lib/adminTokens.js';
import { requireCohortAdmin } from '../middleware/cohortAuth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Auth ──────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'adminaipm@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminproject123@#';

// POST /api/cohort-admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = generateToken();
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// POST /api/cohort-admin/logout
router.post('/logout', requireCohortAdmin, (req, res) => {
  const token = req.headers.authorization!.slice(7);
  revokeToken(token);
  res.json({ success: true });
});

// ── Projects CRUD ─────────────────────────────────────────────────────────────

// GET /api/cohort-admin/projects — all projects with sections + feedback counts
router.get('/projects', requireCohortAdmin, async (_req, res) => {
  try {
    const { data: projects, error: pErr } = await supabaseAdmin
      .from('cohort_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (pErr) throw pErr;

    const { data: assignments, error: aErr } = await supabaseAdmin
      .from('project_section_assignments')
      .select('*');

    if (aErr) throw aErr;

    const combined = (projects ?? []).map((p: any) => ({
      ...p,
      sections: (assignments ?? []).filter((a: any) => a.project_id === p.id),
    }));

    res.json({ success: true, data: combined });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cohort-admin/projects — create
router.post('/projects', requireCohortAdmin, async (req, res) => {
  try {
    const {
      title, description, builder_name, builder_linkedin,
      thumbnail_url, video_link, workflow_link, doc_link, hosted_link,
      project_category, status,
      sections, // [{ section, rank, award_name, cohort_label }]
    } = req.body;

    const { data: project, error } = await supabaseAdmin
      .from('cohort_projects')
      .insert({
        title, description, builder_name, builder_linkedin,
        thumbnail_url, user_image_url: req.body.user_image_url ?? null,
        video_link, workflow_link, doc_link, hosted_link,
        project_category: project_category || 'AI Tools',
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    if (sections?.length) {
      const rows = sections.map((s: any) => ({ ...s, project_id: project.id }));
      const { error: sErr } = await supabaseAdmin.from('project_section_assignments').insert(rows);
      if (sErr) throw sErr;
    }

    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cohort-admin/projects/:id — update
router.put('/projects/:id', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, builder_name, builder_linkedin,
      thumbnail_url, user_image_url, video_link, workflow_link, doc_link, hosted_link,
      project_category, status, sections,
    } = req.body;

    const { error } = await supabaseAdmin
      .from('cohort_projects')
      .update({
        title, description, builder_name, builder_linkedin,
        thumbnail_url, user_image_url: user_image_url ?? null,
        video_link, workflow_link, doc_link, hosted_link,
        project_category, status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // Re-sync sections
    await supabaseAdmin.from('project_section_assignments').delete().eq('project_id', id);
    if (sections?.length) {
      const rows = sections.map((s: any) => ({ ...s, project_id: id }));
      const { error: sErr } = await supabaseAdmin.from('project_section_assignments').insert(rows);
      if (sErr) throw sErr;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/cohort-admin/projects/:id/status — toggle publish/draft
router.patch('/projects/:id/status', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'published' | 'draft' };

    const { error } = await supabaseAdmin
      .from('cohort_projects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cohort-admin/projects/:id
router.delete('/projects/:id', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Also delete thumbnail from storage if present
    const { data: project } = await supabaseAdmin
      .from('cohort_projects')
      .select('thumbnail_url')
      .eq('id', id)
      .single();

    if ((project as any)?.thumbnail_url) {
      const url: string = (project as any).thumbnail_url;
      const pathMatch = url.match(/project-thumbnails\/(.+)$/);
      if (pathMatch) {
        await supabaseAdmin.storage.from('project-thumbnails').remove([pathMatch[1]]);
      }
    }

    const { error } = await supabaseAdmin.from('cohort_projects').delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Thumbnail Upload ──────────────────────────────────────────────────────────

// POST /api/cohort-admin/upload-thumbnail
// Expects multipart/form-data with field "thumbnail" (already compressed by client)
router.post('/upload-thumbnail', requireCohortAdmin, upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const filename = `thumbnails/${Date.now()}.jpg`;
    const { error } = await supabaseAdmin.storage
      .from('project-thumbnails')
      .upload(filename, req.file.buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from('project-thumbnails').getPublicUrl(filename);
    res.json({ success: true, url: data.publicUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── User Image Upload ─────────────────────────────────────────────────────────

// POST /api/cohort-admin/upload-user-image
router.post('/upload-user-image', requireCohortAdmin, upload.single('user_image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const filename = `user-images/${Date.now()}.jpg`;
    const { error } = await supabaseAdmin.storage
      .from('project-thumbnails')
      .upload(filename, req.file.buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from('project-thumbnails').getPublicUrl(filename);
    res.json({ success: true, url: data.publicUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Project User Management ───────────────────────────────────────────────────

// GET /api/cohort-admin/project-users
router.get('/project-users', requireCohortAdmin, async (_req, res) => {
  try {
    const { data: users, error: uErr } = await supabaseAdmin
      .from('project_users')
      .select('id, username, email, created_at')
      .order('created_at', { ascending: false });

    if (uErr) throw uErr;

    const { data: perms, error: pErr } = await supabaseAdmin
      .from('project_user_permissions')
      .select('user_id, project_id, cohort_projects(id, title)');

    if (pErr) throw pErr;

    const combined = (users ?? []).map((u: any) => ({
      ...u,
      projects: (perms ?? [])
        .filter((p: any) => p.user_id === u.id)
        .map((p: any) => p.cohort_projects),
    }));

    res.json({ success: true, data: combined });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cohort-admin/project-users
router.post('/project-users', requireCohortAdmin, async (req, res) => {
  try {
    const { username, email, password, projectIds = [] } = req.body as {
      username: string; email: string; password: string; projectIds?: string[];
    };

    if (!username?.trim() || !email?.trim() || !password) {
      res.status(400).json({ success: false, message: 'username, email and password are required' });
      return;
    }

    const password_hash = await bcryptHash(password, 10);

    const { data: user, error: uErr } = await supabaseAdmin
      .from('project_users')
      .insert({ username: username.trim(), email: email.trim(), password_hash })
      .select('id, username, email')
      .single();

    if (uErr) throw uErr;

    if (projectIds.length > 0) {
      const rows = projectIds.map((project_id: string) => ({ user_id: user.id, project_id }));
      const { error: pErr } = await supabaseAdmin.from('project_user_permissions').insert(rows);
      if (pErr) throw pErr;
    }

    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ success: false, message: 'Username already taken' });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// DELETE /api/cohort-admin/project-users/:userId
router.delete('/project-users/:userId', requireCohortAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { error } = await supabaseAdmin.from('project_users').delete().eq('id', userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cohort-admin/project-users/:userId/projects — replace project assignments
router.put('/project-users/:userId/projects', requireCohortAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectIds = [] } = req.body as { projectIds?: string[] };

    await supabaseAdmin.from('project_user_permissions').delete().eq('user_id', userId);

    if (projectIds.length > 0) {
      const rows = projectIds.map((project_id: string) => ({ user_id: userId, project_id }));
      const { error } = await supabaseAdmin.from('project_user_permissions').insert(rows);
      if (error) throw error;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
