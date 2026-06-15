import { Router } from 'express';
import multer from 'multer';
import { hash as bcryptHash } from 'bcryptjs';
import { pool } from '../db/index.js';
import { uploadBlob, deleteBlob } from '../lib/azureStorage.js';
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
    const { rows: projects } = await pool.query(
      `SELECT * FROM cohort_projects ORDER BY created_at DESC`
    );

    const { rows: assignments } = await pool.query(
      `SELECT * FROM project_section_assignments`
    );

    const combined = projects.map((p) => ({
      ...p,
      sections: assignments.filter((a) => a.project_id === p.id),
    }));

    res.json({ success: true, data: combined });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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

    const { rows } = await pool.query(
      `INSERT INTO cohort_projects
        (title, description, builder_name, builder_linkedin, thumbnail_url, user_image_url,
         video_link, workflow_link, doc_link, hosted_link, project_category, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title, description, builder_name, builder_linkedin,
        thumbnail_url, req.body.user_image_url ?? null,
        video_link, workflow_link, doc_link, hosted_link,
        project_category || 'AI Tools',
        status || 'draft',
      ]
    );

    const project = rows[0];

    if (Array.isArray(sections) && sections.length > 0) {
      for (const s of sections) {
        await pool.query(
          `INSERT INTO project_section_assignments (project_id, section, rank, award_name, cohort_label)
           VALUES ($1, $2, $3, $4, $5)`,
          [project.id, s.section, s.rank ?? 999, s.award_name ?? null, s.cohort_label ?? null]
        );
      }
    }

    res.status(201).json({ success: true, data: project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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

    await pool.query(
      `UPDATE cohort_projects SET
        title = $1, description = $2, builder_name = $3, builder_linkedin = $4,
        thumbnail_url = $5, user_image_url = $6, video_link = $7, workflow_link = $8,
        doc_link = $9, hosted_link = $10, project_category = $11, status = $12,
        updated_at = NOW()
       WHERE id = $13`,
      [
        title, description, builder_name, builder_linkedin,
        thumbnail_url, user_image_url ?? null,
        video_link, workflow_link, doc_link, hosted_link,
        project_category, status,
        id,
      ]
    );

    // Re-sync sections
    await pool.query(`DELETE FROM project_section_assignments WHERE project_id = $1`, [id]);
    if (Array.isArray(sections) && sections.length > 0) {
      for (const s of sections) {
        await pool.query(
          `INSERT INTO project_section_assignments (project_id, section, rank, award_name, cohort_label)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, s.section, s.rank ?? 999, s.award_name ?? null, s.cohort_label ?? null]
        );
      }
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// PATCH /api/cohort-admin/projects/:id/status — toggle publish/draft
router.patch('/projects/:id/status', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'published' | 'draft' };

    await pool.query(
      `UPDATE cohort_projects SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// DELETE /api/cohort-admin/projects/:id
router.delete('/projects/:id', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Also delete thumbnail from storage if present
    const { rows } = await pool.query(
      `SELECT thumbnail_url FROM cohort_projects WHERE id = $1 LIMIT 1`,
      [id]
    );

    const project = rows[0];
    if (project?.thumbnail_url) {
      const url: string = project.thumbnail_url;
      const m = url.match(/\.blob\.core\.windows\.net\/project-thumbnails\/(.+)$/);
      if (m) {
        await deleteBlob('project-thumbnails', m[1]);
      }
    }

    await pool.query(`DELETE FROM cohort_projects WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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
    const url = await uploadBlob('project-thumbnails', filename, req.file.buffer, 'image/jpeg');
    res.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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
    const url = await uploadBlob('project-thumbnails', filename, req.file.buffer, 'image/jpeg');
    res.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// ── Project User Management ───────────────────────────────────────────────────

// GET /api/cohort-admin/project-users
router.get('/project-users', requireCohortAdmin, async (_req, res) => {
  try {
    const { rows: users } = await pool.query(
      `SELECT id, username, email, created_at FROM project_users ORDER BY created_at DESC`
    );

    const { rows: perms } = await pool.query(
      `SELECT pup.user_id, pup.project_id, cp.id AS cp_id, cp.title AS cp_title
       FROM project_user_permissions pup
       JOIN cohort_projects cp ON cp.id = pup.project_id`
    );

    const combined = users.map((u) => ({
      ...u,
      projects: perms
        .filter((p) => p.user_id === u.id)
        .map((p) => ({ id: p.cp_id, title: p.cp_title })),
    }));

    res.json({ success: true, data: combined });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
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

    const { rows } = await pool.query(
      `INSERT INTO project_users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username.trim(), email.trim(), password_hash]
    );

    const user = rows[0];

    if (projectIds.length > 0) {
      for (const project_id of projectIds) {
        await pool.query(
          `INSERT INTO project_user_permissions (user_id, project_id) VALUES ($1, $2)`,
          [user.id, project_id]
        );
      }
    }

    res.status(201).json({ success: true, data: user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException & { code?: string }).code;
    if (code === '23505') {
      res.status(409).json({ success: false, message: 'Username already taken' });
    } else {
      res.status(500).json({ success: false, message });
    }
  }
});

// DELETE /api/cohort-admin/project-users/:userId
router.delete('/project-users/:userId', requireCohortAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query(`DELETE FROM project_users WHERE id = $1`, [userId]);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// PUT /api/cohort-admin/project-users/:userId/projects — replace project assignments
router.put('/project-users/:userId/projects', requireCohortAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectIds = [] } = req.body as { projectIds?: string[] };

    await pool.query(`DELETE FROM project_user_permissions WHERE user_id = $1`, [userId]);

    if (projectIds.length > 0) {
      for (const project_id of projectIds) {
        await pool.query(
          `INSERT INTO project_user_permissions (user_id, project_id) VALUES ($1, $2)`,
          [userId, project_id]
        );
      }
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// ── Testimonials ──────────────────────────────────────────────────────────────

import { scrapeLinkedInPost } from '../lib/linkedinScraper.js';

// GET /api/cohort-admin/testimonials — public, starred first
router.get('/testimonials', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, bio, post_text, image_url, media_url, post_date, source_url, is_starred, created_at
       FROM testimonials
       ORDER BY is_starred DESC, created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// POST /api/cohort-admin/testimonials/scrape — scrape a LinkedIn URL and persist
router.post('/testimonials/scrape', requireCohortAdmin, async (req, res) => {
  try {
    const { url } = req.body as { url: string };

    if (!url?.trim()) {
      res.status(400).json({ success: false, message: 'url is required' });
      return;
    }

    // Idempotent: if we already have this URL, return it immediately
    const cleanUrl = url.trim().split('?')[0].replace(/\/+$/, '');
    const { rows: existing } = await pool.query(
      `SELECT * FROM testimonials WHERE source_url = $1 LIMIT 1`,
      [cleanUrl]
    );

    if (existing.length > 0) {
      res.json({ success: true, data: existing[0], cached: true });
      return;
    }

    // Scrape — this is the only time we hit LinkedIn
    const scraped = await scrapeLinkedInPost(cleanUrl);

    const { rows } = await pool.query(
      `INSERT INTO testimonials (name, bio, post_text, image_url, media_url, post_date, source_url, is_starred)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        scraped.name, scraped.bio, scraped.post_text,
        scraped.image_url, scraped.media_url, scraped.post_date,
        scraped.source_url, false,
      ]
    );

    res.status(201).json({ success: true, data: rows[0], cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// POST /api/cohort-admin/testimonials/custom — create a hand-written testimonial
router.post('/testimonials/custom', requireCohortAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, bio, post_text, is_starred } = req.body as {
      name: string;
      bio?: string;
      post_text: string;
      is_starred?: string;
    };

    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'name is required' });
      return;
    }
    if (!post_text?.trim()) {
      res.status(400).json({ success: false, message: 'testimonial text is required' });
      return;
    }

    let image_url: string | null = null;
    if (req.file) {
      const ext = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
      const filename = `testimonial-images/${Date.now()}.${ext}`;
      image_url = await uploadBlob(
        'project-thumbnails',
        filename,
        req.file.buffer,
        req.file.mimetype || 'image/jpeg'
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO testimonials (name, bio, post_text, image_url, media_url, post_date, source_url, is_starred)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name.trim(), bio?.trim() || null, post_text.trim(),
        image_url, null, null,
        `custom:${Date.now()}`, is_starred === 'true',
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// PATCH /api/cohort-admin/testimonials/:id/star — toggle star
router.patch('/testimonials/:id/star', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_starred } = req.body as { is_starred: boolean };

    await pool.query(
      `UPDATE testimonials SET is_starred = $1 WHERE id = $2`,
      [is_starred, id]
    );

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// DELETE /api/cohort-admin/testimonials/:id — delete record + mirrored image
router.delete('/testimonials/:id', requireCohortAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT image_url, media_url FROM testimonials WHERE id = $1 LIMIT 1`,
      [id]
    );

    const t = rows[0];

    // Remove mirrored images from Azure Blob Storage
    if (t) {
      for (const field of ['image_url', 'media_url'] as const) {
        const val: string | null = t[field] ?? null;
        if (val) {
          const m = val.match(/\.blob\.core\.windows\.net\/project-thumbnails\/(.+)$/);
          if (m) {
            await deleteBlob('project-thumbnails', m[1]);
          }
        }
      }
    }

    await pool.query(`DELETE FROM testimonials WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

export default router;
