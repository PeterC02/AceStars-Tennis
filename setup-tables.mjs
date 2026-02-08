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

    const sql = readFileSync('supabase-teacher-schema.sql', 'utf8')
    console.log('Executing schema...')
    await client.query(sql)
    console.log('✅ All tables created successfully!')

    // Verify tables exist
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('div_masters', 'boys', 'boy_blocked_slots', 'tennis_schedule')
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
