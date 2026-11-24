import { Router } from 'express';
import multer from 'multer';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';
import { pool } from '../db/index.js';
import { uploadBlob, addSasToUrl } from '../lib/azureStorage.js';
import { generateProjectUserToken, revokeProjectUserToken } from '../lib/projectUserTokens.js';
import { requireProjectUser } from '../middleware/projectUserAuth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });


// ── Helpers ───────────────────────────────────────────────────────────────────

// Ownership: a builder may only touch projects they created (or that an admin assigned to them).
async function ownsProject(userId: string, projectId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(projectId)) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM project_user_permissions WHERE user_id = $1 AND project_id = $2 LIMIT 1`,
    [userId, projectId]
  );
  return rows.length > 0;
}

// Tiny in-memory rate limiter (per IP) for public signup
const signupHits = new Map<string, number[]>();
function signupRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const hits = (signupHits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= 10) { signupHits.set(ip, hits); return true; }
  hits.push(now);
  signupHits.set(ip, hits);
  return false;
}

const isHttpUrl = (v: unknown) => {
  if (v == null || v === '') return true;
  try { const u = new URL(String(v)); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
};
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : null);

// ── Auth ──────────────────────────────────────────────────────────────────────

// POST /api/project-user/signup — public self-signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, website } = req.body as {
      username?: string; email?: string; password?: string; website?: string;
    };

    // Honeypot: real users never fill this hidden field
    if (website) { res.status(400).json({ success: false, message: 'Invalid request' }); return; }

    if (signupRateLimited(req.ip || 'unknown')) {
      res.status(429).json({ success: false, message: 'Too many signups from this network. Try again later.' });
      return;
    }

    const uname = (username ?? '').trim();
    // Email is always <name>@myaicommunity.org; the client sends the full address, only the name part is used
    const DOMAIN = '@myaicommunity.org';
    const rawMail = (email ?? '').trim().toLowerCase();
    const mailName = rawMail.endsWith(DOMAIN) ? rawMail.slice(0, -DOMAIN.length) : rawMail;
    if (!/^[a-z0-9._-]{3,40}$/.test(mailName)) {
      res.status(400).json({ success: false, field: 'email', message: 'Email name must be 3-40 characters: letters, numbers, . _ - (no @)' });
      return;
    }
    const mail = mailName + DOMAIN;
    if (uname.length < 3 || uname.length > 40 || !/^[A-Za-z0-9._-]+$/.test(uname)) {
      res.status(400).json({ success: false, field: 'username', message: 'Username must be 3-40 characters: letters, numbers, . _ -' });
      return;
    }
    if (!password || password.length < 8 || password.length > 200) {
      res.status(400).json({ success: false, field: 'password', message: 'Password must be at least 8 characters' });
      return;
    }

    const { rows: dup } = await pool.query(
      `SELECT username, email FROM project_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = $2 LIMIT 1`,
      [uname, mail]
    );
    if (dup.length > 0) {
      const sameEmail = String(dup[0].email).toLowerCase() === mail;
      res.status(409).json({
        success: false,
        field: sameEmail ? 'email' : 'username',
        message: sameEmail ? 'This email is already taken' : 'Username already taken',
      });
      return;
    }

    const password_hash = await bcryptHash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO project_users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email`,
      [uname, mail, password_hash]
    );
    const user = rows[0];
    const token = generateProjectUserToken(user.id);
    res.status(201).json({ success: true, token, user });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === '23505') {
      res.status(409).json({ success: false, field: 'username', message: 'Username already taken' });
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

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
        `SELECT * FROM cohort_projects WHERE id = ANY($1::uuid[]) ORDER BY created_at DESC`,
        [projectIds]
      );
      projects = rows.map((p) => ({
        ...p,
        thumbnail_url:  addSasToUrl(p.thumbnail_url),
        user_image_url: addSasToUrl(p.user_image_url),
        banner_url:     addSasToUrl(p.banner_url),
      }));
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

    if (!(await ownsProject(userId, id))) {
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

    res.json({ success: true, data: {
      ...project,
      thumbnail_url:  addSasToUrl(project.thumbnail_url),
      user_image_url: addSasToUrl(project.user_image_url),
      banner_url:     addSasToUrl(project.banner_url),
    } });
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

    if (!(await ownsProject(userId, id))) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    // User-editable fields. Never: status, sections/awards/rank, ownership.
    const {
      title,
      builder_name,
      project_category,
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

    for (const l of [video_link, doc_link, hosted_link, workflow_link, builder_linkedin]) {
      if (!isHttpUrl(l)) { res.status(400).json({ success: false, message: 'Links must start with http:// or https://' }); return; }
    }
    const newTitle = clip(title, 150);
    const newBuilder = clip(builder_name, 100);

    await pool.query(
      `UPDATE cohort_projects SET
        title = COALESCE(NULLIF($14, ''), title),
        builder_name = COALESCE(NULLIF($15, ''), builder_name),
        project_category = COALESCE(NULLIF($16, ''), project_category),
        thumbnail_url = COALESCE($2, thumbnail_url),
        description = $1, banner_url = $2, user_image_url = $3,
        what_you_learned = $4, about_user_description = $5,
        whats_included = $6::jsonb,
        visibility_flags = COALESCE(visibility_flags, '{}'::jsonb) || COALESCE($7::jsonb, '{}'::jsonb),
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
        JSON.stringify(Array.isArray(whats_included) ? whats_included : []),
        visibility_flags ?? null,
        video_link ?? null,
        doc_link ?? null,
        hosted_link ?? null,
        workflow_link ?? null,
        builder_linkedin ?? null,
        id,
        newTitle,
        newBuilder,
        clip(project_category, 60),
      ]
    );

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// Publishing is admin-only: students/builders can create and edit, but every project they create stays a draft
// until an admin publishes it (Cohort Admin dashboard). Set to true to give builders self-publish again.
const STUDENTS_CAN_PUBLISH = false;
const PUBLISH_FORBIDDEN_MSG = 'Only an admin can publish or unpublish projects. Your project stays a draft until an admin publishes it.';

// PATCH /api/project-user/projects/:id/publish
router.patch('/projects/:id/publish', requireProjectUser, async (req, res) => {
  if (!STUDENTS_CAN_PUBLISH) { res.status(403).json({ success: false, message: PUBLISH_FORBIDDEN_MSG }); return; }
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;

    if (!(await ownsProject(userId, id))) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }

    const { rows: cur } = await pool.query(
      `SELECT title, builder_name, description, video_link, hosted_link FROM cohort_projects WHERE id = $1`,
      [id]
    );
    const c = cur[0];
    if (!c) { res.status(404).json({ success: false, message: 'Project not found' }); return; }
    const missing: string[] = [];
    if (!c.title?.trim()) missing.push('title');
    if (!c.builder_name?.trim()) missing.push('builder name');
    if (!c.description?.trim()) missing.push('description');
    if (!c.video_link?.trim() && !c.hosted_link?.trim()) missing.push('a demo video or live demo link');
    if (missing.length > 0) {
      res.status(400).json({ success: false, message: `Add ${missing.join(', ')} before publishing` });
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

// PATCH /api/project-user/projects/:id/unpublish — back to private draft
router.patch('/projects/:id/unpublish', requireProjectUser, async (req, res) => {
  if (!STUDENTS_CAN_PUBLISH) { res.status(403).json({ success: false, message: PUBLISH_FORBIDDEN_MSG }); return; }
  try {
    const userId = req.projectUserId!;
    const { id } = req.params;
    if (!(await ownsProject(userId, id))) {
      res.status(403).json({ success: false, message: 'No access to this project' });
      return;
    }
    await pool.query(`UPDATE cohort_projects SET status = 'draft', updated_at = NOW() WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// POST /api/project-user/projects — create a new draft owned by the caller
router.post('/projects', requireProjectUser, async (req, res) => {
  try {
    const userId = req.projectUserId!;
    const title = clip(req.body?.title, 150);
    const builderName = clip(req.body?.builder_name, 100);
    if (!title || !builderName) {
      res.status(400).json({ success: false, message: 'Project title and your name are required' });
      return;
    }
    const category = clip(req.body?.project_category, 60) || 'AI Tools';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO cohort_projects (title, builder_name, project_category, status)
         VALUES ($1, $2, $3, 'draft') RETURNING id`,
        [title, builderName, category]
      );
      const id = rows[0].id as string;
      await client.query(
        `INSERT INTO project_user_permissions (user_id, project_id) VALUES ($1, $2)`,
        [userId, id]
      );
      await client.query('COMMIT');
      res.status(201).json({ success: true, data: { id } });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
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

    if (!/^image\//.test(req.file.mimetype)) {
      res.status(400).json({ success: false, message: 'Only image files are allowed' });
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
