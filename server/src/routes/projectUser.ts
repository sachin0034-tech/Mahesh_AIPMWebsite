import { Router } from 'express';
import multer from 'multer';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateProjectUserToken, revokeProjectUserToken } from '../lib/projectUserTokens.js';
import { requireProjectUser } from '../middleware/projectUserAuth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Auth ──────────────────────────────────────────────────────────────────────

// POST /api/project-user/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password required' });
      return;
    }

    const input = username.trim();

    // Allow login with either username or email
    const { data: user, error } = await supabaseAdmin
      .from('project_users')
      .select('id, username, email, password_hash')
      .or(`username.eq.${input},email.eq.${input}`)
      .single();

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const valid = await bcryptCompare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateProjectUserToken(user.id);
    res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/project-user/logout
router.post('/logout', requireProjectUser, (req, res) => {
  const token = req.headers.authorization!.slice(7);
  revokeProjectUserToken(token);
  res.json({ success: true });
});

// ── My Projects ───────────────────────────────────────────────────────────────

// GET /api/project-user/me — user info + assigned projects
router.get('/me', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;

    const { data: user, error: uErr } = await supabaseAdmin
      .from('project_users')
      .select('id, username, email')
      .eq('id', userId)
      .single();

    if (uErr || !user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { data: perms, error: pErr } = await supabaseAdmin
      .from('project_user_permissions')
      .select('project_id')
      .eq('user_id', userId);

    if (pErr) throw pErr;

    const projectIds = (perms ?? []).map((p: any) => p.project_id);

    let projects: any[] = [];
    if (projectIds.length > 0) {
      const { data, error: prErr } = await supabaseAdmin
        .from('cohort_projects')
        .select('*')
        .in('id', projectIds);
      if (prErr) throw prErr;
      projects = data ?? [];
    }

    res.json({ success: true, user, projects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/project-user/projects/:id
router.get('/projects/:id', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    // Check permission
    const { data: perm } = await supabaseAdmin
      .from('project_user_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', id)
      .single();

    if (!perm) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    const { data: project, error } = await supabaseAdmin
      .from('cohort_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/project-user/projects/:id — save edits
router.put('/projects/:id', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    // Check permission
    const { data: perm } = await supabaseAdmin
      .from('project_user_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', id)
      .single();

    if (!perm) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    // Only allow user-editable fields (not title, status, category, sections)
    const {
      description,
      banner_url,
      user_image_url,
      what_you_learned,
      about_user_description,
      whats_included,
      visibility_flags,
      video_link,
      doc_link,
      hosted_link,
      workflow_link,
      builder_linkedin,
    } = req.body;

    const { error } = await supabaseAdmin
      .from('cohort_projects')
      .update({
        description: description ?? null,
        banner_url: banner_url ?? null,
        user_image_url: user_image_url ?? null,
        what_you_learned: what_you_learned ?? null,
        about_user_description: about_user_description ?? null,
        whats_included: whats_included ?? [],
        visibility_flags: visibility_flags ?? null,
        video_link: video_link ?? null,
        doc_link: doc_link ?? null,
        hosted_link: hosted_link ?? null,
        workflow_link: workflow_link ?? null,
        builder_linkedin: builder_linkedin ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/project-user/projects/:id/publish
router.patch('/projects/:id/publish', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    const { data: perm } = await supabaseAdmin
      .from('project_user_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', id)
      .single();

    if (!perm) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('cohort_projects')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/project-user/upload-asset?type=banner|user_image
router.post('/upload-asset', requireProjectUser, upload.single('asset'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const type = (req.query.type as string) || 'banner';
    if (type !== 'banner' && type !== 'user_image') {
      res.status(400).json({ success: false, message: 'type must be banner or user_image' });
      return;
    }

    const folder = type === 'banner' ? 'banners' : 'user_images';
    const filename = `${folder}/${Date.now()}.jpg`;

    const { error } = await supabaseAdmin.storage
      .from('project-assets')
      .upload(filename, req.file.buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from('project-assets').getPublicUrl(filename);
    res.json({ success: true, url: data.publicUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
