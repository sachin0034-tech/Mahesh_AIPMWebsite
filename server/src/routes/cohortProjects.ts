import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// GET /api/cohort-projects?section=top10|awards|cohort8
// Returns published projects for the given section, sorted by rank
router.get('/', async (req, res) => {
  try {
    const section = req.query.section as string | undefined;

    const { data: projects, error: pErr } = await supabaseAdmin
      .from('cohort_projects')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (pErr) throw pErr;

    const { data: assignments, error: aErr } = await supabaseAdmin
      .from('project_section_assignments')
      .select('*');

    if (aErr) throw aErr;

    // Attach sections to each project
    let combined = (projects ?? []).map((p: any) => ({
      ...p,
      sections: (assignments ?? []).filter((a: any) => a.project_id === p.id),
    }));

    // Filter by section if requested
    if (section) {
      combined = combined
        .filter((p: any) => p.sections.some((s: any) => s.section === section))
        .sort((a: any, b: any) => {
          const ra = a.sections.find((s: any) => s.section === section)?.rank ?? 999;
          const rb = b.sections.find((s: any) => s.section === section)?.rank ?? 999;
          return ra - rb;
        });
    }

    res.json({ success: true, data: combined });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
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
    const { data: existing } = await supabaseAdmin
      .from('project_feedback')
      .select('id, vote_type')
      .eq('project_id', id)
      .eq('voter_id', voter_id)
      .single();

    if (existing) {
      res.status(409).json({ success: false, message: 'Already voted' });
      return;
    }

    // Record vote
    await supabaseAdmin.from('project_feedback').insert({ project_id: id, vote_type, voter_id });

    // Increment counter
    const field = vote_type === 'up' ? 'thumbs_up' : 'thumbs_down';
    const { data: project } = await supabaseAdmin
      .from('cohort_projects')
      .select(field)
      .eq('id', id)
      .single();

    await supabaseAdmin
      .from('cohort_projects')
      .update({ [field]: ((project as any)?.[field] ?? 0) + 1 })
      .eq('id', id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
