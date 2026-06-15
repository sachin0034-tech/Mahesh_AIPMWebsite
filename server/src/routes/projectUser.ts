import { Router } from 'express';
import multer from 'multer';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';
import { pool } from '../db/index.js';
import { uploadBlob } from '../lib/azureStorage.js';
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
    const { rows } = await pool.query(
      `SELECT id, username, email, password_hash FROM project_users WHERE username = $1 OR email = $1 LIMIT 1`,
      [input]
    );

    const user = rows[0];
    if (!user) {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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

    const { rows: userRows } = await pool.query(
      `SELECT id, username, email FROM project_users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    const user = userRows[0];
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { rows: perms } = await pool.query(
      `SELECT project_id FROM project_user_permissions WHERE user_id = $1`,
      [userId]
    );

    const projectIds = perms.map((p) => p.project_id as string);

    let projects: unknown[] = [];
    if (projectIds.length > 0) {
      const { rows } = await pool.query(
        `SELECT * FROM cohort_projects WHERE id = ANY($1::uuid[])`,
        [projectIds]
      );
      projects = rows;
    }

    res.json({ success: true, user, projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// GET /api/project-user/projects/:id
router.get('/projects/:id', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    // Check permission
    const { rows: permRows } = await pool.query(
      `SELECT id FROM project_user_permissions WHERE user_id = $1 AND project_id = $2 LIMIT 1`,
      [userId, id]
    );

    if (permRows.length === 0) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    const { rows } = await pool.query(
      `SELECT * FROM cohort_projects WHERE id = $1 LIMIT 1`,
      [id]
    );

    const project = rows[0];
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, data: project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// PUT /api/project-user/projects/:id — save edits
router.put('/projects/:id', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    // Check permission
    const { rows: permRows } = await pool.query(
      `SELECT id FROM project_user_permissions WHERE user_id = $1 AND project_id = $2 LIMIT 1`,
      [userId, id]
    );

    if (permRows.length === 0) {
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

    await pool.query(
      `UPDATE cohort_projects SET
        description = $1, banner_url = $2, user_image_url = $3,
        what_you_learned = $4, about_user_description = $5,
        whats_included = $6, visibility_flags = $7,
        video_link = $8, doc_link = $9, hosted_link = $10,
        workflow_link = $11, builder_linkedin = $12,
        updated_at = NOW()
       WHERE id = $13`,
      [
        description ?? null,
        banner_url ?? null,
        user_image_url ?? null,
        what_you_learned ?? null,
        about_user_description ?? null,
        whats_included ?? [],
        visibility_flags ?? null,
        video_link ?? null,
        doc_link ?? null,
        hosted_link ?? null,
        workflow_link ?? null,
        builder_linkedin ?? null,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// PATCH /api/project-user/projects/:id/publish
router.patch('/projects/:id/publish', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    const { rows: permRows } = await pool.query(
      `SELECT id FROM project_user_permissions WHERE user_id = $1 AND project_id = $2 LIMIT 1`,
      [userId, id]
    );

    if (permRows.length === 0) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    await pool.query(
      `UPDATE cohort_projects SET status = 'published', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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

    const url = await uploadBlob('project-assets', filename, req.file.buffer, 'image/jpeg');
    res.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

export default router;
