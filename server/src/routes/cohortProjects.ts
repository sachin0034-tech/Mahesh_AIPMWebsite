import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /api/cohort-projects?section=top10|awards|cohort8
// Returns published projects for the given section, sorted by rank
router.get('/', async (req, res) => {
  try {
    const section = req.query.section as string | undefined;

    const { rows: projects } = await pool.query(
      `SELECT * FROM cohort_projects WHERE status = 'published' ORDER BY created_at DESC`
    );

    const { rows: assignments } = await pool.query(
      `SELECT * FROM project_section_assignments`
    );

    // Attach sections to each project
    let combined = projects.map((p) => ({
      ...p,
      sections: assignments.filter((a) => a.project_id === p.id),
    }));

    // Filter by section if requested
    if (section) {
      combined = combined
        .filter((p) => p.sections.some((s: { section: string; rank: number }) => s.section === section))
        .sort((a, b) => {
          const ra = a.sections.find((s: { section: string; rank: number }) => s.section === section)?.rank ?? 999;
          const rb = b.sections.find((s: { section: string; rank: number }) => s.section === section)?.rank ?? 999;
          return ra - rb;
        });
    }

    res.json({ success: true, data: combined });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// GET /api/cohort-projects/:id — single published project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM cohort_projects WHERE id = $1 AND status = 'published' LIMIT 1`,
      [id]
    );

    const project = rows[0];
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const { rows: assignments } = await pool.query(
      `SELECT * FROM project_section_assignments WHERE project_id = $1`,
      [id]
    );

    res.json({ success: true, data: { ...project, sections: assignments } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

// POST /api/cohort-projects/:id/vote
// Anonymous vote — one per voter_id per project
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type, voter_id } = req.body as { vote_type: 'up' | 'down'; voter_id: string };

    if (!vote_type || !voter_id) {
      res.status(400).json({ success: false, message: 'vote_type and voter_id are required' });
      return;
    }

    // Check if already voted
    const { rows: existing } = await pool.query(
      `SELECT id, vote_type FROM project_feedback WHERE project_id = $1 AND voter_id = $2 LIMIT 1`,
      [id, voter_id]
    );

    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'Already voted' });
      return;
    }

    // Record vote
    await pool.query(
      `INSERT INTO project_feedback (project_id, vote_type, voter_id) VALUES ($1, $2, $3)`,
      [id, vote_type, voter_id]
    );

    // Increment counter atomically
    const field = vote_type === 'up' ? 'thumbs_up' : 'thumbs_down';
    await pool.query(
      `UPDATE cohort_projects SET ${field} = COALESCE(${field}, 0) + 1 WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message });
  }
});

export default router;
