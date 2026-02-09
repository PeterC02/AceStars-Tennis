import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch teacher upload readiness for a term
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term') || 'Summer 2026'

  // Get all active div masters
  const { data: teachers } = await supabase
    .from('div_masters')
    .select('id, name, email, division')
    .eq('is_active', true)
    .order('name')

  // Get upload statuses for this term
  const { data: statuses } = await supabase
    .from('teacher_upload_status')
    .select('*')
    .eq('term', term)

  // Get boy counts per teacher
  const { data: boys } = await supabase
    .from('boys')
    .select('div_master_id')

  // Get blocked slot counts per teacher for this term
  const { data: blockedSlots } = await supabase
    .from('boy_blocked_slots')
    .select('uploaded_by')
    .eq('term', term)

  // Get latest timetable generation
  const { data: latestGen } = await supabase
    .from('timetable_generation')
    .select('*')
    .eq('term', term)
    .order('created_at', { ascending: false })
    .limit(1)

  const teacherStatuses = (teachers || []).map(t => {
    const status = (statuses || []).find(s => s.div_master_id === t.id)
    const boyCount = (boys || []).filter(b => b.div_master_id === t.id).length
    const blockedCount = (blockedSlots || []).filter(bs => bs.uploaded_by === t.id).length

    return {
      teacherId: t.id,
      teacherName: t.name,
      email: t.email,
      division: t.division,
      boysCount: boyCount,
      blockedSlotsCount: blockedCount,
      isComplete: status?.is_complete || false,
      completedAt: status?.completed_at || null,
    }
  })

  const allComplete = teacherStatuses.length > 0 && teacherStatuses.every(t => t.isComplete)

  return NextResponse.json({
    teachers: teacherStatuses,
    allComplete,
    totalTeachers: teacherStatuses.length,
    completedTeachers: teacherStatuses.filter(t => t.isComplete).length,
    latestGeneration: latestGen?.[0] || null,
  })
}

// POST - Mark upload as complete / publish timetable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'mark_complete') {
      const { divMasterId, term } = body
      const { error } = await supabase
        .from('teacher_upload_status')
        .upsert({
          div_master_id: divMasterId,
          term,
          is_complete: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'div_master_id,term' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'mark_incomplete') {
      const { divMasterId, term } = body
      const { error } = await supabase
        .from('teacher_upload_status')
        .upsert({
          div_master_id: divMasterId,
          term,
          is_complete: false,
          completed_at: null,
        }, { onConflict: 'div_master_id,term' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'publish_timetable') {
      const { term, totalLessons, totalBoys, unscheduledCount } = body
      const { error } = await supabase
        .from('timetable_generation')
        .insert({
          term,
          generated_by: 'admin',
          total_lessons: totalLessons || 0,
          total_boys: totalBoys || 0,
          unscheduled_count: unscheduledCount || 0,
          is_published: true,
          published_at: new Date().toISOString(),
        })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
