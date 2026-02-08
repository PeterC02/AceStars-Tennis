import pg from 'pg'
import { readFileSync } from 'fs'

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:YOUR_PASSWORD@db.phrcfxzohgygjibfsflp.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  try {
    console.log('Connecting to Supabase PostgreSQL...')
    await client.connect()
    console.log('Connected!')

    // Ensure the trigger function exists first
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)
    console.log('✓ Trigger function ready')

    const sql1 = readFileSync('supabase-teacher-schema.sql', 'utf8')
    console.log('Executing teacher schema...')
    await client.query(sql1)
    console.log('✓ Teacher tables created')

    const sql2 = readFileSync('supabase-shared-schedule-schema.sql', 'utf8')
    console.log('Executing shared schedule schema...')
    await client.query(sql2)
    console.log('✓ Shared schedule tables created')

    console.log('✅ All tables created successfully!')

    // Verify tables exist
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('div_masters', 'boys', 'boy_blocked_slots', 'tennis_schedule', 'coach_preferences', 'schedule_constraints', 'teacher_upload_status', 'timetable_generation')
      ORDER BY table_name
    `)
    console.log('\nVerified tables:')
    res.rows.forEach(r => console.log(`  ✓ ${r.table_name}`))
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await client.end()
  }
}

run()
