import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const
const SLOTS = ['breakfast', 'fruit', 'rest'] as const

type Day = typeof DAYS[number]
type Slot = typeof SLOTS[number]

// Load coaches and constraints from database
async function loadCoachesFromDB() {
  const { data } = await supabase.from('coach_preferences').select('*').order('coach_name')
  return (data || []).map((c: any) => ({
    id: c.coach_id,
    name: c.coach_name,
    color: c.color,
    preferredSlots: c.preferred_slots || [],
    avoidSlots: c.avoid_slots || [],
    maxSessionsPerDay: c.max_sessions_per_day || 3,
    preferredDays: c.preferred_days || [],
    avoidDays: c.avoid_days || [],
  }))
}

async function loadConstraintsFromDB() {
  const { data } = await supabase.from('schedule_constraints').select('*').order('priority', { ascending: false })
  return data || []
}

function getSlotCapacity(day: string, slot: string, constraints: any[], maxCoaches: number): number {
  for (const c of constraints) {
    if (!c.enabled || c.constraint_type !== 'reduce_slot') continue
    const val = typeof c.value === 'string' ? JSON.parse(c.value) : c.value
    if (val.day === day && val.slot === slot) {
      return Math.floor(maxCoaches * (1 - val.reduction / 100))
    }
  }
  return maxCoaches
}

// POST - Generate schedule
export async function POST(request: NextRequest) {
  try {
    const { term } = await request.json()

    if (!term) {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 })
    }

    // Fetch all boys with their blocked slots
    const { data: boys, error: boysError } = await supabase
      .from('boys')
      .select('*, boy_blocked_slots(*)')
      .order('name')

    if (boysError) {
      return NextResponse.json({ error: boysError.message }, { status: 500 })
    }

    if (!boys || boys.length === 0) {
      return NextResponse.json({ error: 'No boys found. Please add boys first.' }, { status: 400 })
    }

    // Load coaches and constraints from DB
    const dbCoaches = await loadCoachesFromDB()
    const dbConstraints = await loadConstraintsFromDB()
    const maxCoachesConstraint = dbConstraints.find((c: any) => c.id === 'c1')
    const maxCoachesVal = maxCoachesConstraint?.enabled ? (typeof maxCoachesConstraint.value === 'string' ? JSON.parse(maxCoachesConstraint.value) : maxCoachesConstraint.value).maxCoaches || 6 : 7

    // Fetch existing locked entries (manual overrides)
    const { data: lockedEntries } = await supabase
      .from('tennis_schedule')
      .select('*')
      .eq('term', term)
      .eq('is_locked', true)

    // Build blocked slots map: boyId -> Set of "day-slot"
    const blockedMap: Record<string, Set<string>> = {}
    boys.forEach((boy: any) => {
      blockedMap[boy.id] = new Set()
      const termSlots = (boy.boy_blocked_slots || []).filter((bs: any) => bs.term === term)
      termSlots.forEach((bs: any) => {
        blockedMap[boy.id].add(`${bs.day}-${bs.slot}`)
      })
    })

    // Schedule generation with constraint satisfaction
    type ScheduleEntry = {
      boyId: string
      boyName: string
      coachId: string
      day: Day
      slot: Slot
      isLocked: boolean
    }

    const schedule: ScheduleEntry[] = []

    // Add locked entries first
    if (lockedEntries) {
      lockedEntries.forEach((entry: any) => {
        const boy = boys.find((b: any) => b.id === entry.boy_id)
        if (boy) {
          schedule.push({
            boyId: entry.boy_id,
            boyName: boy.name,
            coachId: entry.coach_id,
            day: entry.day as Day,
            slot: entry.slot as Slot,
            isLocked: true,
          })
        }
      })
    }

    // Track state
    const boyLessonCount: Record<string, number> = {}
    const boyScheduledDays: Record<string, Day[]> = {}
    const slotUsage: Record<string, number> = {}
    const coachDayCount: Record<string, Record<string, number>> = {}

    boys.forEach((b: any) => {
      boyLessonCount[b.id] = 0
      boyScheduledDays[b.id] = []
    })
    dbCoaches.forEach((c: any) => {
      coachDayCount[c.id] = {}
      DAYS.forEach(d => { coachDayCount[c.id][d] = 0 })
    })
    DAYS.forEach(d => {
      SLOTS.forEach(s => {
        slotUsage[`${d}-${s}`] = 0
      })
    })

    // Account for locked entries in counters
    schedule.forEach(entry => {
      boyLessonCount[entry.boyId] = (boyLessonCount[entry.boyId] || 0) + 1
      if (!boyScheduledDays[entry.boyId]) boyScheduledDays[entry.boyId] = []
      boyScheduledDays[entry.boyId].push(entry.day)
      slotUsage[`${entry.day}-${entry.slot}`]++
      if (coachDayCount[entry.coachId]) coachDayCount[entry.coachId][entry.day]++
    })

    // Score a potential assignment
    const scoreAssignment = (
      boy: any,
      coachId: string,
      day: Day,
      slot: Slot
    ): number => {
      const key = `${day}-${slot}`

      // HARD CONSTRAINTS (return -Infinity)

      // 1. HIGHEST PRIORITY: Boy has a school lesson in this slot
      if (blockedMap[boy.id]?.has(key)) return -Infinity

      // 2. Slot at capacity
      const capacity = getSlotCapacity(day, slot, dbConstraints, maxCoachesVal)
      if (slotUsage[key] >= capacity) return -Infinity

      // 3. Coach already teaching in this slot
      const coachBusy = schedule.some(e => e.day === day && e.slot === slot && e.coachId === coachId)
      if (coachBusy) return -Infinity

      // 4. Boy already has a lesson in this slot
      const boyBusy = schedule.some(e => e.day === day && e.slot === slot && e.boyId === boy.id)
      if (boyBusy) return -Infinity

      // 5. Coach max sessions per day (from DB preferences)
      const coachPref = dbCoaches.find((c: any) => c.id === coachId)
      const maxPerDay = coachPref?.maxSessionsPerDay || 3
      if ((coachDayCount[coachId]?.[day] || 0) >= maxPerDay) return -Infinity

      // SOFT CONSTRAINTS (adjust score)
      let score = 1000

      // Coach preference match (+100)
      if (boy.coach_preference === coachId) score += 100

      // Coach preferred slots from DB (+50)
      if (coachPref?.preferredSlots?.includes(slot)) score += 50

      // Coach avoid slots from DB (-100)
      if (coachPref?.avoidSlots?.includes(slot)) score -= 100

      // Coach preferred days from DB (+30)
      if (coachPref?.preferredDays?.includes(day)) score += 30

      // Coach avoid days from DB (-80)
      if (coachPref?.avoidDays?.includes(day)) score -= 80

      // Spread lessons across different days (+50 if new day)
      if (!boyScheduledDays[boy.id]?.includes(day)) score += 50

      // Avoid consecutive days (-30)
      const dayIdx = DAYS.indexOf(day)
      const scheduledDays = boyScheduledDays[boy.id] || []
      for (const sd of scheduledDays) {
        const sdIdx = DAYS.indexOf(sd)
        if (Math.abs(dayIdx - sdIdx) === 1) score -= 30
      }

      // Prefer lower utilization slots (+10 per available spot)
      score += (getSlotCapacity(day, slot, dbConstraints, maxCoachesVal) - slotUsage[key]) * 10

      // Balance coach load (-15 per existing lesson on same day)
      score -= (coachDayCount[coachId]?.[day] || 0) * 15

      // Prefer mid-week (+10 for Tue/Wed/Thu)
      if (dayIdx >= 1 && dayIdx <= 3) score += 10

      // Prefer breakfast and fruit over rest for variety
      if (slot === 'breakfast') score += 5
      if (slot === 'fruit') score += 3

      return score
    }

    // Sort boys: most lessons needed first, then by number of blocked slots (most constrained first)
    const sortedBoys = [...boys].sort((a: any, b: any) => {
      const aBlocked = blockedMap[a.id]?.size || 0
      const bBlocked = blockedMap[b.id]?.size || 0
      // Most constrained first (more blocked = fewer options = schedule first)
      if (bBlocked !== aBlocked) return bBlocked - aBlocked
      // Then by lessons needed
      const aNeeded = (a.lessons_per_week || 2) - (boyLessonCount[a.id] || 0)
      const bNeeded = (b.lessons_per_week || 2) - (boyLessonCount[b.id] || 0)
      return bNeeded - aNeeded
    })

    // Multiple passes to fill schedule
    for (let pass = 0; pass < 4; pass++) {
      const boysThisPass = pass === 0 ? sortedBoys : [...sortedBoys].sort(() => Math.random() - 0.5)

      for (const boy of boysThisPass) {
        const lessonsNeeded = (boy.lessons_per_week || 2) - (boyLessonCount[boy.id] || 0)
        if (lessonsNeeded <= 0) continue

        // Determine coach: preference first, then round-robin
        const preferredCoach = boy.coach_preference
        const coachOrder = preferredCoach
          ? [preferredCoach, ...dbCoaches.map((c: any) => c.id).filter((id: string) => id !== preferredCoach)]
          : dbCoaches.map((c: any) => c.id)

        let bestAssignment: { coachId: string; day: Day; slot: Slot; score: number } | null = null

        for (const coachId of coachOrder) {
          for (const day of DAYS) {
            for (const slot of SLOTS) {
              const score = scoreAssignment(boy, coachId, day, slot)
              if (score > -Infinity && (!bestAssignment || score > bestAssignment.score)) {
                bestAssignment = { coachId, day, slot, score }
              }
            }
          }
        }

        if (bestAssignment) {
          schedule.push({
            boyId: boy.id,
            boyName: boy.name,
            coachId: bestAssignment.coachId,
            day: bestAssignment.day,
            slot: bestAssignment.slot,
            isLocked: false,
          })
          boyLessonCount[boy.id] = (boyLessonCount[boy.id] || 0) + 1
          if (!boyScheduledDays[boy.id]) boyScheduledDays[boy.id] = []
          boyScheduledDays[boy.id].push(bestAssignment.day)
          slotUsage[`${bestAssignment.day}-${bestAssignment.slot}`]++
          if (coachDayCount[bestAssignment.coachId]) {
            coachDayCount[bestAssignment.coachId][bestAssignment.day]++
          }
        }
      }
    }

    // Save schedule to database
    const nonLockedEntries = schedule.filter(e => !e.isLocked)

    // Delete old non-locked entries for this term
    await supabase
      .from('tennis_schedule')
      .delete()
      .eq('term', term)
      .eq('is_locked', false)

    // Insert new entries
    if (nonLockedEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('tennis_schedule')
        .insert(nonLockedEntries.map(e => ({
          boy_id: e.boyId,
          coach_id: e.coachId,
          day: e.day,
          slot: e.slot,
          term,
          is_locked: false,
        })))

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    // Calculate stats
    const unscheduled = boys.filter((b: any) => (boyLessonCount[b.id] || 0) < (b.lessons_per_week || 2))
    const coachUtilization: Record<string, number> = {}
    dbCoaches.forEach((c: any) => {
      coachUtilization[c.name] = schedule.filter(e => e.coachId === c.id).length
    })

    return NextResponse.json({
      schedule: schedule.map(e => ({
        ...e,
        coachName: dbCoaches.find((c: any) => c.id === e.coachId)?.name || e.coachId,
        coachColor: dbCoaches.find((c: any) => c.id === e.coachId)?.color || '#999',
      })),
      stats: {
        totalLessons: schedule.length,
        totalBoys: boys.length,
        unscheduledBoys: unscheduled.map((b: any) => ({
          name: b.name,
          needed: b.lessons_per_week || 2,
          scheduled: boyLessonCount[b.id] || 0,
        })),
        coachUtilization,
      },
      coaches: dbCoaches.map((c: any) => ({ id: c.id, name: c.name, color: c.color })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Fetch existing schedule
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term')

  if (!term) {
    return NextResponse.json({ error: 'Term is required' }, { status: 400 })
  }

  const { data: entries, error } = await supabase
    .from('tennis_schedule')
    .select('*, boys(name, year_group, division, coach_preference)')
    .eq('term', term)
    .order('day')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Load coaches from DB for name/color mapping
  const dbCoaches = await loadCoachesFromDB()

  const schedule = (entries || []).map((e: any) => ({
    boyId: e.boy_id,
    boyName: e.boys?.name || 'Unknown',
    coachId: e.coach_id,
    coachName: dbCoaches.find((c: any) => c.id === e.coach_id)?.name || e.coach_id,
    coachColor: dbCoaches.find((c: any) => c.id === e.coach_id)?.color || '#999',
    day: e.day,
    slot: e.slot,
    isLocked: e.is_locked,
  }))

  // Also get latest generation info
  const { data: latestGen } = await supabase
    .from('timetable_generation')
    .select('*')
    .eq('term', term)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)

  return NextResponse.json({
    schedule,
    coaches: dbCoaches.map((c: any) => ({ id: c.id, name: c.name, color: c.color })),
    isPublished: !!latestGen?.[0],
    publishedAt: latestGen?.[0]?.published_at || null,
  })
}
