import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Create tables if they don't exist
export async function POST(request: NextRequest) {
  const results: { step: string; status: string; error?: string }[] = []

  // 1. Create div_masters table
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS div_masters (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      pin_hash TEXT NOT NULL,
      division TEXT,
      is_active BOOLEAN DEFAULT true
    )`
  }).single()

  if (e1) {
    // rpc not available — try via raw insert to check if table exists
    results.push({ step: 'div_masters via rpc', status: 'failed', error: e1.message })
  } else {
    results.push({ step: 'div_masters', status: 'ok' })
  }

  return NextResponse.json({ results, note: 'If rpc failed, tables must be created via Supabase SQL Editor' })
}

// GET - Check if tables exist
export async function GET() {
  const tables = ['div_masters', 'boys', 'boy_blocked_slots', 'tennis_schedule']
  const results: { table: string; exists: boolean; error?: string }[] = []

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1)
    results.push({
      table,
      exists: !error,
      error: error?.message,
    })
  }

  return NextResponse.json({ tables: results })
}
