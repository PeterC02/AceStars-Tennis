import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch boys for a div master (or all boys)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const divMasterId = searchParams.get('divMasterId')
  const term = searchParams.get('term')

  let query = supabase
    .from('boys')
    .select('*, boy_blocked_slots(*)')
    .order('name')

  if (divMasterId) {
    query = query.eq('div_master_id', divMasterId)
  }

  if (term) {
    // Filter blocked slots by term
    query = supabase
      .from('boys')
      .select('*, boy_blocked_slots!inner(*)')
      .eq('boy_blocked_slots.term', term)
      .order('name')

    if (divMasterId) {
      query = query.eq('div_master_id', divMasterId)
    }
  }

  const { data, error } = await query

  if (error) {
    // If no rows match the inner join, fetch boys without blocked slots
    const { data: allBoys, error: fallbackError } = await supabase
      .from('boys')
      .select('*, boy_blocked_slots(*)')
      .order('name')
      .eq(divMasterId ? 'div_master_id' : 'id', divMasterId || '')

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }
    return NextResponse.json({ boys: allBoys || [] })
  }

  return NextResponse.json({ boys: data })
}

// POST - Add a boy or batch add boys
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (Array.isArray(body.boys)) {
      // Batch insert
      const { data, error } = await supabase
        .from('boys')
        .insert(body.boys.map((b: any) => ({
          name: b.name,
          year_group: b.yearGroup || null,
          division: b.division || null,
          div_master_id: b.divMasterId,
          coach_preference: b.coachPreference || null,
          lessons_per_week: b.lessonsPerWeek || 2,
          notes: b.notes || null,
        })))
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ boys: data })
    }

    // Single insert
    const { data, error } = await supabase
      .from('boys')
      .insert({
        name: body.name,
        year_group: body.yearGroup || null,
        division: body.division || null,
        div_master_id: body.divMasterId,
        coach_preference: body.coachPreference || null,
        lessons_per_week: body.lessonsPerWeek || 2,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ boy: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update a boy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('boys')
      .update({
        name: body.name,
        year_group: body.yearGroup,
        division: body.division,
        coach_preference: body.coachPreference,
        lessons_per_week: body.lessonsPerWeek,
        notes: body.notes,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ boy: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove a boy
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const { error } = await supabase.from('boys').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
