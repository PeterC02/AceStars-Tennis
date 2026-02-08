import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Ludgrove tennis slot times
const SLOT_TIMES = {
  breakfast: { start: '08:05', end: '08:35', label: 'Breakfast (8:05-8:35am)' },
  fruit:     { start: '10:55', end: '11:25', label: 'Fruit (10:55-11:25am)' },
  rest:      { start: '13:55', end: '14:20', label: 'Rest (1:55-2:20pm)' },
} as const

// Check if a school lesson time overlaps with a tennis slot
function doesLessonOverlap(lessonStart: string, lessonEnd: string, slotKey: string): boolean {
  const slot = SLOT_TIMES[slotKey as keyof typeof SLOT_TIMES]
  if (!slot) return false

  // Convert HH:MM to minutes for comparison
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const lStart = toMinutes(lessonStart)
  const lEnd = toMinutes(lessonEnd)
  const sStart = toMinutes(slot.start)
  const sEnd = toMinutes(slot.end)

  // Overlap if lesson starts before slot ends AND lesson ends after slot starts
  return lStart < sEnd && lEnd > sStart
}

// POST - Upload timetable data for boys (parsed from CSV/manual entry)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'upload_blocked_slots') {
      // Direct upload of blocked slots
      // Format: { boyId, term, blockedSlots: [{ day, slot, schoolLesson }] }
      const { boyId, term, blockedSlots, uploadedBy } = body

      if (!boyId || !term || !blockedSlots) {
        return NextResponse.json({ error: 'boyId, term, and blockedSlots are required' }, { status: 400 })
      }

      // Delete existing blocked slots for this boy+term
      await supabase
        .from('boy_blocked_slots')
        .delete()
        .eq('boy_id', boyId)
        .eq('term', term)

      // Insert new blocked slots
      if (blockedSlots.length > 0) {
        const { error } = await supabase
          .from('boy_blocked_slots')
          .insert(blockedSlots.map((bs: any) => ({
            boy_id: boyId,
            day: bs.day,
            slot: bs.slot,
            school_lesson: bs.schoolLesson || null,
            term,
            uploaded_by: uploadedBy || null,
          })))

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, count: blockedSlots.length })
    }

    if (action === 'parse_csv') {
      // Parse CSV timetable data
      // Expected CSV format:
      // Boy Name, Day, Period/Time, Lesson
      // OR: Boy Name, Mon 8:00-8:40, Mon 10:50-11:30, Mon 13:50-14:25, Tue 8:00-8:40, ...
      const { csvData, term, divMasterId } = body

      if (!csvData || !term) {
        return NextResponse.json({ error: 'csvData and term are required' }, { status: 400 })
      }

      const lines = csvData.trim().split('\n').map((l: string) => l.trim()).filter((l: string) => l)
      if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 })
      }

      const header = lines[0].split(',').map((h: string) => h.trim())
      const results: { boyName: string; blockedCount: number; error?: string }[] = []

      // Detect CSV format
      const daySlotPattern = /^(mon|tue|wed|thu|fri)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i
      const isTimeBasedFormat = header.some((h: string) => daySlotPattern.test(h))

      if (isTimeBasedFormat) {
        // Format: Boy Name, Mon 8:00-8:40, Mon 10:50-11:30, ...
        // Each cell contains the lesson name (or empty if free)
        const timeColumns: { day: string; startTime: string; endTime: string; colIndex: number }[] = []

        header.forEach((h: string, idx: number) => {
          const match = h.match(/^(mon|tue|wed|thu|fri)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i)
          if (match) {
            const dayMap: Record<string, string> = { mon: 'mon', tue: 'tue', wed: 'wed', thu: 'thu', fri: 'fri' }
            timeColumns.push({
              day: dayMap[match[1].toLowerCase()] || match[1].toLowerCase(),
              startTime: match[2].padStart(5, '0'),
              endTime: match[3].padStart(5, '0'),
              colIndex: idx,
            })
          }
        })

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c: string) => c.trim())
          const boyName = cols[0]
          if (!boyName) continue

          // Find or create boy
          let { data: boy } = await supabase
            .from('boys')
            .select('id')
            .eq('name', boyName)
            .single()

          if (!boy) {
            const { data: newBoy, error: createError } = await supabase
              .from('boys')
              .insert({ name: boyName, div_master_id: divMasterId || null })
              .select('id')
              .single()

            if (createError) {
              results.push({ boyName, blockedCount: 0, error: createError.message })
              continue
            }
            boy = newBoy
          }

          // Determine blocked slots
          const blockedSlots: { day: string; slot: string; schoolLesson: string }[] = []

          for (const tc of timeColumns) {
            const lessonName = cols[tc.colIndex] || ''
            if (!lessonName) continue // Empty = free period

            // Check if this school lesson overlaps with any tennis slot
            for (const slotKey of ['breakfast', 'fruit', 'rest']) {
              if (doesLessonOverlap(tc.startTime, tc.endTime, slotKey)) {
                // Check not already added
                if (!blockedSlots.some(bs => bs.day === tc.day && bs.slot === slotKey)) {
                  blockedSlots.push({ day: tc.day, slot: slotKey, schoolLesson: lessonName })
                }
              }
            }
          }

          // Save blocked slots
          await supabase
            .from('boy_blocked_slots')
            .delete()
            .eq('boy_id', boy!.id)
            .eq('term', term)

          if (blockedSlots.length > 0) {
            await supabase
              .from('boy_blocked_slots')
              .insert(blockedSlots.map(bs => ({
                boy_id: boy!.id,
                day: bs.day,
                slot: bs.slot,
                school_lesson: bs.schoolLesson,
                term,
                uploaded_by: divMasterId || null,
              })))
          }

          results.push({ boyName, blockedCount: blockedSlots.length })
        }
      } else {
        // Simple format: Boy Name, Day, Time Start, Time End, Lesson
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c: string) => c.trim())
          if (cols.length < 5) continue

          const [boyName, day, timeStart, timeEnd, lessonName] = cols
          const dayLower = day.toLowerCase().substring(0, 3)

          // Find or create boy
          let { data: boy } = await supabase
            .from('boys')
            .select('id')
            .eq('name', boyName)
            .single()

          if (!boy) {
            const { data: newBoy } = await supabase
              .from('boys')
              .insert({ name: boyName, div_master_id: divMasterId || null })
              .select('id')
              .single()
            boy = newBoy
          }

          if (!boy) continue

          // Check overlaps
          for (const slotKey of ['breakfast', 'fruit', 'rest']) {
            if (doesLessonOverlap(timeStart, timeEnd, slotKey)) {
              await supabase
                .from('boy_blocked_slots')
                .upsert({
                  boy_id: boy.id,
                  day: dayLower,
                  slot: slotKey,
                  school_lesson: lessonName,
                  term,
                  uploaded_by: divMasterId || null,
                }, { onConflict: 'boy_id,day,slot,term' })
            }
          }

          const existing = results.find(r => r.boyName === boyName)
          if (existing) existing.blockedCount++
          else results.push({ boyName, blockedCount: 1 })
        }
      }

      return NextResponse.json({ success: true, results })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Fetch blocked slots for boys
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term')
  const boyId = searchParams.get('boyId')
  const divMasterId = searchParams.get('divMasterId')

  let query = supabase
    .from('boy_blocked_slots')
    .select('*, boys(name, year_group, division)')
    .order('day')

  if (term) query = query.eq('term', term)
  if (boyId) query = query.eq('boy_id', boyId)
  if (divMasterId) query = query.eq('uploaded_by', divMasterId)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blockedSlots: data })
}
