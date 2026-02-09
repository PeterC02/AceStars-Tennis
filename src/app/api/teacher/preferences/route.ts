import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch coach preferences and constraints
export async function GET() {
  const [coachRes, constraintRes] = await Promise.all([
    supabase.from('coach_preferences').select('*').order('coach_name'),
    supabase.from('schedule_constraints').select('*').order('priority', { ascending: false }),
  ])

  return NextResponse.json({
    coaches: coachRes.data || [],
    constraints: constraintRes.data || [],
  })
}

// POST - Update coach preferences or constraints
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'update_coach') {
      const { coach_id, preferred_slots, avoid_slots, max_sessions_per_day, preferred_days, avoid_days } = body
      const { error } = await supabase
        .from('coach_preferences')
        .update({
          preferred_slots: preferred_slots || [],
          avoid_slots: avoid_slots || [],
          max_sessions_per_day: max_sessions_per_day || 3,
          preferred_days: preferred_days || [],
          avoid_days: avoid_days || [],
        })
        .eq('coach_id', coach_id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'toggle_constraint') {
      const { constraint_id, enabled } = body
      const { error } = await supabase
        .from('schedule_constraints')
        .update({ enabled })
        .eq('id', constraint_id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
