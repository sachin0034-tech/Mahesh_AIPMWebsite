import pg from 'pg';

const { Pool } = pg;

const SUPABASE_URL = 'https://fzsvkvizhcvarbgzifud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6c3Zrdml6aGN2YXJiZ3ppZnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3MjE3OSwiZXhwIjoyMDkwNTQ4MTc5fQ.-ysmHySw15sZmC98b8tGaxCZE9CiZ0sNt6wJajqXkD4';
const AZURE_URL = 'postgresql://postgressadminmahesh:%40chortDB-project@cohort-db.postgres.database.azure.com:5432/postgres?sslmode=require';

const pool = new Pool({ connectionString: AZURE_URL });

async function fetchFromSupabase(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function migrate() {
  console.log('Starting migration from Supabase → Azure PostgreSQL...\n');

  // 1. cohort_projects
  const projects = await fetchFromSupabase('cohort_projects');
  console.log(`cohort_projects: ${projects.length} rows`);
  for (const p of projects) {
    await pool.query(
      `INSERT INTO cohort_projects
        (id, title, description, builder_name, builder_linkedin, thumbnail_url, user_image_url,
         banner_url, video_link, workflow_link, doc_link, hosted_link, project_category, status,
         thumbs_up, thumbs_down, what_you_learned, about_user_description, whats_included,
         visibility_flags, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id, p.title, p.description, p.builder_name, p.builder_linkedin,
        p.thumbnail_url, p.user_image_url, p.banner_url, p.video_link, p.workflow_link,
        p.doc_link, p.hosted_link, p.project_category, p.status,
        p.thumbs_up ?? 0, p.thumbs_down ?? 0, p.what_you_learned,
        p.about_user_description,
        p.whats_included ? JSON.stringify(p.whats_included) : '[]',
        p.visibility_flags ? JSON.stringify(p.visibility_flags) : null,
        p.created_at, p.updated_at,
      ]
    );
  }
  console.log('✓ cohort_projects done');

  // 2. project_section_assignments
  const assignments = await fetchFromSupabase('project_section_assignments');
  console.log(`project_section_assignments: ${assignments.length} rows`);
  for (const a of assignments) {
    await pool.query(
      `INSERT INTO project_section_assignments (id, project_id, section, rank, award_name, cohort_label)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.project_id, a.section, a.rank ?? 999, a.award_name, a.cohort_label]
    );
  }
  console.log('✓ project_section_assignments done');

  // 3. project_feedback
  const feedback = await fetchFromSupabase('project_feedback');
  console.log(`project_feedback: ${feedback.length} rows`);
  for (const f of feedback) {
    await pool.query(
      `INSERT INTO project_feedback (id, project_id, vote_type, voter_id, created_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [f.id, f.project_id, f.vote_type, f.voter_id, f.created_at]
    );
  }
  console.log('✓ project_feedback done');

  // 4. project_users
  const users = await fetchFromSupabase('project_users');
  console.log(`project_users: ${users.length} rows`);
  for (const u of users) {
    await pool.query(
      `INSERT INTO project_users (id, username, email, password_hash, created_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.username, u.email, u.password_hash, u.created_at]
    );
  }
  console.log('✓ project_users done');

  // 5. project_user_permissions
  const perms = await fetchFromSupabase('project_user_permissions');
  console.log(`project_user_permissions: ${perms.length} rows`);
  for (const p of perms) {
    await pool.query(
      `INSERT INTO project_user_permissions (id, user_id, project_id)
       VALUES ($1,$2,$3)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.user_id, p.project_id]
    );
  }
  console.log('✓ project_user_permissions done');

  // 6. testimonials
  const testimonials = await fetchFromSupabase('testimonials');
  console.log(`testimonials: ${testimonials.length} rows`);
  for (const t of testimonials) {
    await pool.query(
      `INSERT INTO testimonials (id, name, bio, post_text, image_url, media_url, post_date, source_url, is_starred, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, t.name, t.bio, t.post_text, t.image_url, t.media_url, t.post_date, t.source_url, t.is_starred, t.created_at]
    );
  }
  console.log('✓ testimonials done');

  await pool.end();
  console.log('\nMigration complete!');
}

migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
