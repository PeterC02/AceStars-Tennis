'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Calendar, Clock, MapPin, ChevronRight, ChevronDown, 
  Search, Filter, Download, Plus, X, Settings, BarChart3,
  GraduationCap, Building2, CircleDot, RefreshCw, AlertCircle,
  CheckCircle, Upload, FileText, Image as ImageIcon, Edit3,
  Trash2, Copy, Zap, Target, TrendingUp, Info, CreditCard, FileCheck
} from 'lucide-react'

// Types for database bookings
type DBBooking = {
  id: string
  created_at: string
  venue: 'Ludgrove' | 'Edgbarrow' | 'AceStars'
  programme_id: string
  programme_name: string
  programme_category: string
  parent_name: string
  parent_email: string
  parent_phone: string
  children: { name: string; age: string; experience: string; medical_info: string }[]
  camp_days?: { week_id: string; week_name: string; days: string[] }[]
  session_preferences?: {
    preferred_slots: string[]
    avoid_slots: string[]
    preferred_days: string[]
    avoid_days: string[]
    notes: string
  }
  total_price: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: 'invoice' | 'manual'
  invoice_status: 'not_sent' | 'sent' | 'paid' | 'overdue'
  status: 'pending' | 'confirmed' | 'cancelled'
}

// Legacy type for display compatibility
type Booking = {
  id: string
  parentName: string
  parentEmail: string
  parentPhone: string
  childName: string
  childAge: string
  programme: string
  venue: 'Ludgrove' | 'Edgbarrow' | 'AceStars' | 'Yateley Manor'
  stream: string
  status: 'pending' | 'confirmed' | 'cancelled'
  date: string
  price: string
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: 'invoice' | 'manual'
}

type Coach = {
  id: string
  name: string
  students: Student[]
  preferences: CoachPreferences
  color: string
}

type Student = {
  id: string
  name: string
  coachId: string
  lessonsPerWeek: number
  unavailableSlots: string[]
}

type CoachPreferences = {
  preferredSlots: string[]
  avoidSlots: string[]
  maxSessionsPerDay: number
  preferredDays: Day[]
  avoidDays: Day[]
}

type TimeSlot = 'breakfast' | 'fruit' | 'rest'
type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

type ScheduleEntry = {
  day: Day
  slot: TimeSlot
  coachId: string
  studentId: string
  studentName: string
  locked: boolean
}

type Constraint = {
  id: string
  type: 'max_coaches' | 'reduce_slot' | 'avoid_slot' | 'coach_preference' | 'student_spread' | 'coach_balance'
  description: string
  value: any
  enabled: boolean
  priority: number
}

type ScheduleStats = {
  totalLessons: number
  unscheduledStudents: string[]
  coachUtilization: Record<string, number>
  slotUtilization: Record<string, number>
  constraintViolations: string[]
}

// Sample data
const sampleBookings: Booking[] = [
  // Ludgrove
  { id: 'L001', parentName: 'John Smith', parentEmail: 'john@email.com', parentPhone: '07700 900001', childName: 'James Smith', childAge: '10', programme: 'Standard 1-2-1', venue: 'Ludgrove', stream: 'Private Coaching', status: 'confirmed', date: '2026-04-22', price: '£324' },
  { id: 'L002', parentName: 'Sarah Johnson', parentEmail: 'sarah@email.com', parentPhone: '07700 900002', childName: 'Oliver Johnson', childAge: '11', programme: 'Standard 1-2-1', venue: 'Ludgrove', stream: 'Private Coaching', status: 'confirmed', date: '2026-04-22', price: '£324' },
  { id: 'L003', parentName: 'Michael Brown', parentEmail: 'michael@email.com', parentPhone: '07700 900003', childName: 'William Brown', childAge: '9', programme: 'Sunday Clinic', venue: 'Ludgrove', stream: 'Clinics', status: 'pending', date: '2026-04-26', price: '£90' },
  // Edgbarrow
  { id: 'E001', parentName: 'Emma Wilson', parentEmail: 'emma@email.com', parentPhone: '07700 900004', childName: 'Sophie Wilson', childAge: '12', programme: 'Performance Girls', venue: 'Edgbarrow', stream: 'Performance', status: 'confirmed', date: '2026-04-14', price: '£216' },
  { id: 'E002', parentName: 'David Taylor', parentEmail: 'david@email.com', parentPhone: '07700 900005', childName: 'Harry Taylor', childAge: '13', programme: 'Development Y7/8', venue: 'Edgbarrow', stream: 'Development', status: 'confirmed', date: '2026-04-14', price: '£144' },
  { id: 'E003', parentName: 'Lisa Anderson', parentEmail: 'lisa@email.com', parentPhone: '07700 900006', childName: 'Emily Anderson', childAge: '12', programme: 'Y7 AfterSchool Club', venue: 'Edgbarrow', stream: 'AfterSchool Club', status: 'pending', date: '2026-04-13', price: '£78' },
  // AceStars
  { id: 'A001', parentName: 'Robert Davis', parentEmail: 'robert@email.com', parentPhone: '07700 900007', childName: 'Charlie Davis', childAge: '8', programme: 'Orange/Green Ball', venue: 'AceStars', stream: 'Term Time', status: 'confirmed', date: '2026-04-21', price: '£107.88' },
  { id: 'A002', parentName: 'Jennifer White', parentEmail: 'jennifer@email.com', parentPhone: '07700 900008', childName: 'Lucy White', childAge: '7', programme: 'Mini Red', venue: 'AceStars', stream: 'Term Time', status: 'confirmed', date: '2026-04-26', price: '£107.88' },
  { id: 'A003', parentName: 'Thomas Martin', parentEmail: 'thomas@email.com', parentPhone: '07700 900009', childName: 'Jack Martin', childAge: '9', programme: 'Easter Camp Week 1', venue: 'AceStars', stream: 'Holiday Camps', status: 'pending', date: '2026-04-07', price: '£120' },
  // Yateley Manor
  { id: 'Y001', parentName: 'Andrew Clarke', parentEmail: 'andrew@email.com', parentPhone: '07700 900010', childName: 'George Clarke', childAge: '10', programme: 'Standard 1-2-1', venue: 'Yateley Manor', stream: 'Private Coaching', status: 'confirmed', date: '2026-04-22', price: '£280' },
  { id: 'Y002', parentName: 'Rachel Green', parentEmail: 'rachel@email.com', parentPhone: '07700 900011', childName: 'Freddie Green', childAge: '11', programme: 'Group Session', venue: 'Yateley Manor', stream: 'Group Coaching', status: 'pending', date: '2026-04-23', price: '£150' },
]

// Coaches data with colors for visual distinction
const initialCoaches: Coach[] = [
  { id: 'peter', name: 'Peter', students: [], preferences: { preferredSlots: ['breakfast'], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#F87D4D' },
  { id: 'wojtek', name: 'Wojtek', students: [], preferences: { preferredSlots: [], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#65B863' },
  { id: 'ollie', name: 'Ollie', students: [], preferences: { preferredSlots: [], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#dfd300' },
  { id: 'tom', name: 'Tom', students: [], preferences: { preferredSlots: [], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#3B82F6' },
  { id: 'andy', name: 'Andy', students: [], preferences: { preferredSlots: ['fruit'], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#8B5CF6' },
  { id: 'jake', name: 'Jake', students: [], preferences: { preferredSlots: [], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#EC4899' },
  { id: 'james', name: 'James', students: [], preferences: { preferredSlots: [], avoidSlots: [], maxSessionsPerDay: 3, preferredDays: [], avoidDays: [] }, color: '#14B8A6' },
]

// Default constraints with priorities
const defaultConstraints: Constraint[] = [
  { id: 'c1', type: 'max_coaches', description: 'Maximum 6 coaches coaching at any one time', value: 6, enabled: true, priority: 100 },
  { id: 'c2', type: 'reduce_slot', description: 'Reduce Monday breakfast (boys return late every other week)', value: { day: 'mon', slot: 'breakfast', reduction: 50 }, enabled: true, priority: 90 },
  { id: 'c3', type: 'reduce_slot', description: 'Reduce Wednesday rest (sport day)', value: { day: 'wed', slot: 'rest', reduction: 75 }, enabled: true, priority: 90 },
  { id: 'c4', type: 'reduce_slot', description: 'Reduce Friday fruit (boys leave early)', value: { day: 'fri', slot: 'fruit', reduction: 75 }, enabled: true, priority: 90 },
  { id: 'c5', type: 'reduce_slot', description: 'No Friday rest lessons (boys leave early)', value: { day: 'fri', slot: 'rest', reduction: 100 }, enabled: true, priority: 100 },
  { id: 'c6', type: 'student_spread', description: 'Spread student lessons across different days', value: { minDaysBetween: 1 }, enabled: true, priority: 70 },
  { id: 'c7', type: 'coach_balance', description: 'Balance lessons evenly across coaches per day', value: { maxVariance: 1 }, enabled: true, priority: 60 },
]

// Total available slots: 5 days × 3 slots = 15 slots per week per coach
const TOTAL_SLOTS_PER_WEEK = 15

const days: Day[] = ['mon', 'tue', 'wed', 'thu', 'fri']
const dayLabels: Record<Day, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' }
const slots: TimeSlot[] = ['breakfast', 'fruit', 'rest']
const slotLabels: Record<TimeSlot, string> = { breakfast: 'Breakfast', fruit: 'Fruit', rest: 'Rest' }
const slotTimes: Record<TimeSlot, string> = { breakfast: '7:30-8:15am', fruit: '10:30-11:15am', rest: '2:00-2:45pm' }

export default function AdminPage() {
  // Admin login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [adminError, setAdminError] = useState('')

  // Check persisted login
  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('admin-auth')
    if (saved === 'true') setIsAdminLoggedIn(true)
  }, [])

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPin === '2580') {
      setIsAdminLoggedIn(true)
      localStorage.setItem('admin-auth', 'true')
      setAdminError('')
    } else {
      setAdminError('Incorrect PIN')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    localStorage.removeItem('admin-auth')
  }

  const [activeTab, setActiveTab] = useState<'bookings' | 'scheduler'>('bookings')
  const [selectedVenue, setSelectedVenue] = useState<'all' | 'Ludgrove' | 'Edgbarrow' | 'AceStars' | 'Yateley Manor'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedVenues, setExpandedVenues] = useState<string[]>(['Ludgrove', 'Edgbarrow', 'AceStars', 'Yateley Manor'])
  
  // Scheduler state
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches)
  const [constraints, setConstraints] = useState<Constraint[]>(defaultConstraints)
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [studentInput, setStudentInput] = useState('')
  const [selectedCoachForAssignment, setSelectedCoachForAssignment] = useState<string>('')
  const [showConstraintsPanel, setShowConstraintsPanel] = useState(false)
  const [importMethod, setImportMethod] = useState<'text' | 'file' | 'bookings'>('text')

  // Database bookings state
  const [dbBookings, setDbBookings] = useState<DBBooking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [qbStatus, setQbStatus] = useState<{ connected: boolean; error?: string; refreshToken?: { daysRemaining: number; expiringSoon: boolean; warning: string | null } } | null>(null)

  // Teacher readiness state
  const [teacherReadiness, setTeacherReadiness] = useState<{ teachers: any[]; allComplete: boolean; totalTeachers: number; completedTeachers: number; latestGeneration: any } | null>(null)
  const [selectedTerm, setSelectedTerm] = useState('Summer 2026')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch bookings from database
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true)
    try {
      const [bookingsRes, qbRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/quickbooks/status'),
      ])
      const bookingsData = await bookingsRes.json()
      if (bookingsData.bookings) {
        setDbBookings(bookingsData.bookings)
      }
      const qbData = await qbRes.json()
      setQbStatus(qbData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoadingBookings(false)
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Fetch teacher readiness
  const fetchReadiness = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/readiness?term=${encodeURIComponent(selectedTerm)}`)
      const data = await res.json()
      setTeacherReadiness(data)
    } catch {}
  }, [selectedTerm])

  useEffect(() => {
    fetchReadiness()
  }, [fetchReadiness])

  // Generate & Publish timetable (admin only)
  const handleGenerateAndPublish = async () => {
    setIsPublishing(true)
    setPublishMessage(null)
    try {
      // 1. Generate schedule
      const genRes = await fetch('/api/teacher/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: selectedTerm }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) throw new Error(genData.error)

      // 2. Publish
      await fetch('/api/teacher/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish_timetable',
          term: selectedTerm,
          totalLessons: genData.stats.totalLessons,
          totalBoys: genData.stats.totalBoys,
          unscheduledCount: genData.stats.unscheduledBoys.length,
        }),
      })

      setSchedule(genData.schedule.map((e: any) => ({
        day: e.day, slot: e.slot, coachId: e.coachId,
        studentId: e.boyId, studentName: e.boyName, locked: e.isLocked,
      })))
      setPublishMessage({ type: 'success', text: `Published! ${genData.stats.totalLessons} lessons for ${genData.stats.totalBoys} boys. All teachers and coaches can now view the timetable.` })
      fetchReadiness()
    } catch (err: any) {
      setPublishMessage({ type: 'error', text: err.message })
    }
    setIsPublishing(false)
  }

  // Save coach preference to DB
  const saveCoachPreferenceToDB = async (coachId: string, field: string, value: any) => {
    try {
      await fetch('/api/teacher/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_coach', coach_id: coachId, [field]: value }),
      })
    } catch {}
  }

  // Save constraint toggle to DB
  const saveConstraintToDB = async (constraintId: string, enabled: boolean) => {
    try {
      await fetch('/api/teacher/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_constraint', constraint_id: constraintId, enabled }),
      })
    } catch {}
  }

  // Use allBookings (from DB or sample) for filtering
  const bookingsToFilter = useMemo(() => {
    if (dbBookings.length > 0) {
      return dbBookings.map(db => ({
        id: db.id,
        parentName: db.parent_name,
        parentEmail: db.parent_email,
        parentPhone: db.parent_phone,
        childName: db.children[0]?.name || 'N/A',
        childAge: db.children[0]?.age || 'N/A',
        programme: db.programme_name,
        venue: db.venue,
        stream: db.programme_category,
        status: db.status,
        date: new Date(db.created_at).toISOString().split('T')[0],
        price: `£${db.total_price.toFixed(2)}`,
        paymentStatus: db.payment_status,
        paymentMethod: db.payment_method,
      })) as Booking[]
    }
    return sampleBookings
  }, [dbBookings])

  // Filter bookings
  const filteredBookings = bookingsToFilter.filter(booking => {
    const matchesVenue = selectedVenue === 'all' || booking.venue === selectedVenue
    const matchesSearch = searchTerm === '' || 
      booking.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.programme.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesVenue && matchesSearch
  })

  // Group bookings by venue
  const groupedByVenue = filteredBookings.reduce((acc, booking) => {
    if (!acc[booking.venue]) acc[booking.venue] = {}
    if (!acc[booking.venue][booking.stream]) acc[booking.venue][booking.stream] = []
    acc[booking.venue][booking.stream].push(booking)
    return acc
  }, {} as Record<string, Record<string, Booking[]>>)

  const toggleVenue = (venue: string) => {
    setExpandedVenues(prev => 
      prev.includes(venue) ? prev.filter(v => v !== venue) : [...prev, venue]
    )
  }

  // Add students to coach
  const addStudentsToCoach = () => {
    if (!selectedCoachForAssignment || !studentInput.trim()) return
    
    const studentNames = studentInput.split('\n').filter(name => name.trim())
    const newStudents: Student[] = studentNames.map((name, index) => ({
      id: `${selectedCoachForAssignment}-${Date.now()}-${index}`,
      name: name.trim(),
      coachId: selectedCoachForAssignment,
      lessonsPerWeek: 1,
      unavailableSlots: []
    }))
    
    setCoaches(prev => prev.map(coach => 
      coach.id === selectedCoachForAssignment 
        ? { ...coach, students: [...coach.students, ...newStudents] }
        : coach
    ))
    setStudentInput('')
  }

  // Import from Ludgrove bookings
  const importFromBookings = () => {
    const ludgroveBookings = sampleBookings.filter(b => b.venue === 'Ludgrove' && b.stream === 'Private Coaching')
    const studentsPerCoach = Math.ceil(ludgroveBookings.length / coaches.length)
    
    let bookingIndex = 0
    setCoaches(prev => prev.map(coach => {
      const assignedStudents: Student[] = []
      for (let i = 0; i < studentsPerCoach && bookingIndex < ludgroveBookings.length; i++) {
        assignedStudents.push({
          id: `${coach.id}-${Date.now()}-${i}`,
          name: ludgroveBookings[bookingIndex].childName,
          coachId: coach.id,
          lessonsPerWeek: 1,
          unavailableSlots: []
        })
        bookingIndex++
      }
      return { ...coach, students: [...coach.students, ...assignedStudents] }
    }))
  }

  // Remove student
  const removeStudent = (coachId: string, studentId: string) => {
    setCoaches(prev => prev.map(coach => 
      coach.id === coachId 
        ? { ...coach, students: coach.students.filter(s => s.id !== studentId) }
        : coach
    ))
  }

  // Toggle constraint (local + DB)
  const toggleConstraint = (constraintId: string) => {
    setConstraints(prev => {
      const updated = prev.map(c => 
        c.id === constraintId ? { ...c, enabled: !c.enabled } : c
      )
      const target = updated.find(c => c.id === constraintId)
      if (target) saveConstraintToDB(constraintId, target.enabled)
      return updated
    })
  }

  // Advanced Scheduling Algorithm with Constraint Satisfaction
  const generateSchedule = () => {
    setIsGenerating(true)
    
    // Get all students with their coaches
    const allStudents = coaches.flatMap(coach => 
      coach.students.map(student => ({ ...student, coachId: coach.id, coachName: coach.name }))
    )
    
    if (allStudents.length === 0) {
      alert('Please add students to coaches first')
      setIsGenerating(false)
      return
    }

    const newSchedule: ScheduleEntry[] = []
    const studentLessonsCount: Record<string, number> = {}
    const studentScheduledDays: Record<string, Day[]> = {}
    const coachDaySlotCount: Record<string, Record<string, number>> = {}
    const slotUsage: Record<string, number> = {}
    
    // Initialize counters
    allStudents.forEach(s => { 
      studentLessonsCount[s.id] = 0 
      studentScheduledDays[s.id] = []
    })
    coaches.forEach(c => {
      coachDaySlotCount[c.id] = {}
      days.forEach(d => { coachDaySlotCount[c.id][d] = 0 })
    })
    days.forEach(d => {
      slots.forEach(s => {
        slotUsage[`${d}-${s}`] = 0
      })
    })

    // Calculate slot capacity based on constraints
    const getSlotCapacity = (day: Day, slot: TimeSlot): number => {
      const maxCoachesConstraint = constraints.find(c => c.id === 'c1')
      const maxCoaches = maxCoachesConstraint?.enabled ? maxCoachesConstraint.value : 7
      
      for (const constraint of constraints) {
        if (!constraint.enabled || constraint.type !== 'reduce_slot') continue
        if (constraint.value.day === day && constraint.value.slot === slot) {
          const reduction = constraint.value.reduction / 100
          return Math.floor(maxCoaches * (1 - reduction))
        }
      }
      return maxCoaches
    }

    // Check if student can be scheduled on a day (spread constraint)
    const canScheduleOnDay = (studentId: string, day: Day): boolean => {
      const spreadConstraint = constraints.find(c => c.id === 'c6')
      if (!spreadConstraint?.enabled) return true
      
      const scheduledDays = studentScheduledDays[studentId]
      if (scheduledDays.length === 0) return true
      
      const dayIndex = days.indexOf(day)
      for (const scheduledDay of scheduledDays) {
        const scheduledIndex = days.indexOf(scheduledDay)
        if (Math.abs(dayIndex - scheduledIndex) < spreadConstraint.value.minDaysBetween + 1) {
          return false
        }
      }
      return true
    }

    // Calculate score for a slot assignment
    const calculateSlotScore = (
      student: typeof allStudents[0],
      coach: Coach,
      day: Day,
      slot: TimeSlot,
      currentSchedule: ScheduleEntry[]
    ): number => {
      let score = 1000 // Base score
      
      // Hard constraints (return -Infinity if violated)
      const capacity = getSlotCapacity(day, slot)
      const currentCount = currentSchedule.filter(e => e.day === day && e.slot === slot).length
      if (currentCount >= capacity) return -Infinity
      
      // Coach already busy in this slot
      const coachBusy = currentSchedule.some(e => 
        e.day === day && e.slot === slot && e.coachId === coach.id
      )
      if (coachBusy) return -Infinity
      
      // Coach max sessions per day
      if (coachDaySlotCount[coach.id][day] >= coach.preferences.maxSessionsPerDay) return -Infinity
      
      // Student unavailable
      if (student.unavailableSlots.includes(`${day}-${slot}`)) return -Infinity
      
      // Soft constraints (adjust score)
      
      // Coach preferred slots (+50)
      if (coach.preferences.preferredSlots.includes(slot)) score += 50
      
      // Coach avoid slots (-100)
      if (coach.preferences.avoidSlots.includes(slot)) score -= 100
      
      // Coach preferred days (+30)
      if (coach.preferences.preferredDays.includes(day)) score += 30
      
      // Coach avoid days (-80)
      if (coach.preferences.avoidDays.includes(day)) score -= 80
      
      // Spread lessons across the week for this coach (-20 per existing lesson on same day)
      const coachDayCount = currentSchedule.filter(e => e.coachId === coach.id && e.day === day).length
      score -= coachDayCount * 20
      
      // Prefer slots with lower utilization (+10 per available spot)
      const slotKey = `${day}-${slot}`
      const utilization = slotUsage[slotKey] || 0
      score += (capacity - utilization) * 10
      
      // Balance across days of the week
      const dayIndex = days.indexOf(day)
      // Prefer Tuesday, Wednesday, Thursday (middle of week)
      if (dayIndex === 1 || dayIndex === 2 || dayIndex === 3) score += 15
      
      // Spread student lessons across different days
      if (!canScheduleOnDay(student.id, day)) score -= 200
      
      // Prefer breakfast and fruit over rest for variety
      if (slot === 'breakfast') score += 5
      if (slot === 'fruit') score += 3
      
      return score
    }

    // Sort students by lessons needed (prioritize those needing more lessons)
    // Then by coach to group coach's students together
    const sortedStudents = [...allStudents].sort((a, b) => {
      const aNeeded = a.lessonsPerWeek - (studentLessonsCount[a.id] || 0)
      const bNeeded = b.lessonsPerWeek - (studentLessonsCount[b.id] || 0)
      if (bNeeded !== aNeeded) return bNeeded - aNeeded
      return a.coachId.localeCompare(b.coachId)
    })

    // Multiple passes to ensure all students get their required lessons
    const maxPasses = 3
    for (let pass = 0; pass < maxPasses; pass++) {
      // Shuffle students slightly for variety in each pass
      const studentsThisPass = pass === 0 ? sortedStudents : [...sortedStudents].sort(() => Math.random() - 0.5)
      
      for (const student of studentsThisPass) {
        const lessonsNeeded = student.lessonsPerWeek - studentLessonsCount[student.id]
        if (lessonsNeeded <= 0) continue
        
        const coach = coaches.find(c => c.id === student.coachId)!
        
        // Find best slot for this student
        let bestSlot: { day: Day; slot: TimeSlot; score: number } | null = null
        
        for (const day of days) {
          for (const slot of slots) {
            const score = calculateSlotScore(student, coach, day, slot, newSchedule)
            
            if (score > -Infinity && (!bestSlot || score > bestSlot.score)) {
              bestSlot = { day, slot, score }
            }
          }
        }
        
        if (bestSlot) {
          newSchedule.push({
            day: bestSlot.day,
            slot: bestSlot.slot,
            coachId: student.coachId,
            studentId: student.id,
            studentName: student.name,
            locked: false
          })
          studentLessonsCount[student.id]++
          studentScheduledDays[student.id].push(bestSlot.day)
          coachDaySlotCount[student.coachId][bestSlot.day]++
          slotUsage[`${bestSlot.day}-${bestSlot.slot}`]++
        }
      }
    }
    
    // Log unscheduled students
    const unscheduled = allStudents.filter(s => studentLessonsCount[s.id] < s.lessonsPerWeek)
    if (unscheduled.length > 0) {
      console.warn('Unscheduled students:', unscheduled.map(s => s.name))
    }
    
    setSchedule(newSchedule)
    setIsGenerating(false)
  }

  // Get schedule entry for a specific coach, day, and slot
  const getScheduleEntry = (coachId: string, day: Day, slot: TimeSlot): ScheduleEntry | null => {
    return schedule.find(e => e.coachId === coachId && e.day === day && e.slot === slot) || null
  }

  // Calculate schedule statistics
  const scheduleStats = useMemo((): ScheduleStats => {
    const allStudents = coaches.flatMap(c => c.students)
    const scheduledStudentIds = new Set(schedule.map(e => e.studentId))
    const unscheduledStudents = allStudents.filter(s => !scheduledStudentIds.has(s.id)).map(s => s.name)
    
    const coachUtilization: Record<string, number> = {}
    coaches.forEach(c => {
      const coachLessons = schedule.filter(e => e.coachId === c.id).length
      coachUtilization[c.name] = coachLessons
    })
    
    const slotUtilization: Record<string, number> = {}
    days.forEach(d => {
      slots.forEach(s => {
        slotUtilization[`${dayLabels[d]} ${slotLabels[s]}`] = schedule.filter(e => e.day === d && e.slot === s).length
      })
    })
    
    return {
      totalLessons: schedule.length,
      unscheduledStudents,
      coachUtilization,
      slotUtilization,
      constraintViolations: []
    }
  }, [schedule, coaches])

  // Update student lessons per week
  const updateStudentLessons = (coachId: string, studentId: string, lessonsPerWeek: number) => {
    setCoaches(prev => prev.map(coach => 
      coach.id === coachId 
        ? { 
            ...coach, 
            students: coach.students.map(s => 
              s.id === studentId ? { ...s, lessonsPerWeek } : s
            )
          }
        : coach
    ))
  }

  // Update coach preferences
  const updateCoachPreference = (coachId: string, field: keyof CoachPreferences, value: any) => {
    setCoaches(prev => prev.map(coach => 
      coach.id === coachId 
        ? { ...coach, preferences: { ...coach.preferences, [field]: value } }
        : coach
    ))
  }

  // Clear all students
  const clearAllStudents = () => {
    setCoaches(prev => prev.map(coach => ({ ...coach, students: [] })))
    setSchedule([])
  }

  // Export timetable as CSV
  const exportTimetable = () => {
    let csv = 'Coach,Day,Slot,Time,Student\n'
    schedule.forEach(entry => {
      const coach = coaches.find(c => c.id === entry.coachId)
      csv += `${coach?.name},${dayLabels[entry.day]},${slotLabels[entry.slot]},${slotTimes[entry.slot]},${entry.studentName}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ludgrove-timetable.csv'
    a.click()
  }

  // Stats (using filteredBookings from earlier)
  const totalBookings = filteredBookings.length
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length
  const paidBookings = filteredBookings.filter(b => b.paymentStatus === 'paid').length
  const totalStudents = coaches.reduce((sum, c) => sum + c.students.length, 0)

  // Admin login gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1E2333 0%, #2a3050 50%, #1E2333 100%)' }}>
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <Link href="/">
              <p className="text-3xl font-bold text-white mb-1">AceStars <span style={{ color: '#dfd300' }}>Admin</span></p>
            </Link>
            <p className="text-sm" style={{ color: '#AFB0B3' }}>Enter your admin PIN to continue</p>
          </div>
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#FFF' }}>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Admin PIN</label>
                <input
                  type="password" required value={adminPin}
                  onChange={e => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all text-center text-2xl tracking-widest"
                  style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  placeholder="••••"
                  inputMode="numeric" maxLength={6} autoFocus
                />
              </div>
              {adminError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <AlertCircle size={16} /> {adminError}
                </div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]" style={{ backgroundColor: '#dfd300', color: '#1E2333' }}>
                Sign In
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/teacher-admin" className="text-xs hover:underline" style={{ color: '#F87D4D' }}>
                Div Master / Coach? Login here →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F9FA' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold" style={{ color: '#1E2333' }}>
                AceStars <span style={{ color: '#dfd300' }}>Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/teacher-admin" className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}>
                Div Master Portal
              </Link>
              <Link href="/" className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: '#EAEDE6', color: '#676D82' }}>
                Back to Site
              </Link>
              <button onClick={handleAdminLogout} className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#EF4444' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* QuickBooks Status Banner */}
        {qbStatus && (
          <div className={`mb-4 rounded-xl p-4 flex items-center justify-between ${
            !qbStatus.connected ? 'bg-red-50 border border-red-200' :
            qbStatus.refreshToken?.expiringSoon ? 'bg-amber-50 border border-amber-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{!qbStatus.connected ? '❌' : qbStatus.refreshToken?.expiringSoon ? '⚠️' : '✅'}</span>
              <div>
                <p className="font-medium text-sm" style={{ color: '#1E2333' }}>
                  QuickBooks: {!qbStatus.connected ? 'Disconnected' : qbStatus.refreshToken?.expiringSoon ? 'Token Expiring Soon' : 'Connected'}
                </p>
                <p className="text-xs" style={{ color: '#676D82' }}>
                  {!qbStatus.connected ? (qbStatus.error || 'Please re-authorize') :
                   qbStatus.refreshToken?.expiringSoon ? `${qbStatus.refreshToken.daysRemaining} days until token expires` :
                   `Token valid for ${qbStatus.refreshToken?.daysRemaining || '?'} more days`}
                </p>
              </div>
            </div>
            {(!qbStatus.connected || qbStatus.refreshToken?.expiringSoon) && (
              <a href="/api/quickbooks/auth" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1E2333' }}>
                Re-authorize
              </a>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#676D82' }}>Total Bookings</p>
                <p className="text-3xl font-bold" style={{ color: '#1E2333' }}>{totalBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dfd300' }}>
                <Users size={24} style={{ color: '#1E2333' }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#676D82' }}>Confirmed</p>
                <p className="text-3xl font-bold" style={{ color: '#65B863' }}>{confirmedBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#65B863' }}>
                <CheckCircle size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#676D82' }}>Pending</p>
                <p className="text-3xl font-bold" style={{ color: '#F87D4D' }}>{pendingBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F87D4D' }}>
                <Clock size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#676D82' }}>Ludgrove Students</p>
                <p className="text-3xl font-bold" style={{ color: '#1E2333' }}>{totalStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1E2333' }}>
                <GraduationCap size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* BOOKINGS SECTION - Always visible */}
        {(
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#AFB0B3' }} />
                  <input
                    type="text"
                    placeholder="Search by name, programme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: '#EAEDE6' }}
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'Ludgrove', 'Edgbarrow', 'AceStars', 'Yateley Manor'] as const).map(venue => (
                    <button
                      key={venue}
                      onClick={() => setSelectedVenue(venue)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all`}
                      style={{
                        backgroundColor: selectedVenue === venue ? '#1E2333' : '#F7F9FA',
                        color: selectedVenue === venue ? '#FFFFFF' : '#676D82'
                      }}
                    >
                      {venue === 'all' ? 'All Venues' : venue}
                    </button>
                  ))}
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {Object.entries(groupedByVenue).map(([venue, streams]) => (
                <div key={venue} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleVenue(venue)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {venue === 'Ludgrove' && <GraduationCap size={24} style={{ color: '#F87D4D' }} />}
                      {venue === 'Edgbarrow' && <Building2 size={24} style={{ color: '#65B863' }} />}
                      {venue === 'AceStars' && <CircleDot size={24} style={{ color: '#dfd300' }} />}
                      {venue === 'Yateley Manor' && <MapPin size={24} style={{ color: '#8B5CF6' }} />}
                      <h3 className="text-xl font-bold" style={{ color: '#1E2333' }}>{venue}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}>
                        {Object.values(streams).flat().length} bookings
                      </span>
                    </div>
                    <ChevronDown 
                      size={24} 
                      style={{ color: '#676D82' }}
                      className={`transition-transform ${expandedVenues.includes(venue) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {expandedVenues.includes(venue) && (
                    <div className="border-t" style={{ borderColor: '#EAEDE6' }}>
                      {Object.entries(streams).map(([stream, bookings]) => (
                        <div key={stream} className="border-b last:border-b-0" style={{ borderColor: '#EAEDE6' }}>
                          <div className="px-6 py-3 bg-gray-50">
                            <h4 className="font-medium" style={{ color: '#1E2333' }}>{stream}</h4>
                          </div>
                          <div className="divide-y" style={{ borderColor: '#EAEDE6' }}>
                            {bookings.map(booking => (
                              <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: booking.status === 'confirmed' ? '#65B863' : '#F87D4D' }}
                                  >
                                    {booking.childName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium" style={{ color: '#1E2333' }}>{booking.childName}</p>
                                    <p className="text-sm" style={{ color: '#676D82' }}>{booking.programme}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-sm" style={{ color: '#676D82' }}>{booking.parentName}</p>
                                    <p className="text-xs" style={{ color: '#AFB0B3' }}>{booking.parentEmail}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold" style={{ color: '#1E2333' }}>{booking.price}</p>
                                    <span 
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                      }`}
                                    >
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* LUDGROVE TIMETABLE SCHEDULER - Always visible at bottom */}
        <div className="mt-12 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Ludgrove Timetable Scheduler</h2>
                <p className="text-green-100">Generate weekly coaching timetables for all 7 coaches (Mon-Fri, Breakfast/Fruit/Rest)</p>
              </div>
              <select
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-bold border-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}
              >
                {['Spring 2026', 'Summer 2026', 'Autumn 2026', 'Spring 2027'].map(t => (
                  <option key={t} value={t} style={{ color: '#1E2333' }}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Readiness Dashboard */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#1E2333' }}>
                  <GraduationCap size={20} className="inline mr-2" style={{ color: '#F87D4D' }} />
                  Div Master Upload Status — {selectedTerm}
                </h3>
                <p className="text-sm mt-1" style={{ color: '#676D82' }}>
                  {teacherReadiness?.completedTeachers || 0} of {teacherReadiness?.totalTeachers || 0} teachers have completed their uploads
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchReadiness} className="p-2 rounded-lg hover:bg-gray-100">
                  <RefreshCw size={16} style={{ color: '#676D82' }} />
                </button>
                <button
                  onClick={handleGenerateAndPublish}
                  disabled={isPublishing || !teacherReadiness || teacherReadiness.totalTeachers === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: teacherReadiness?.allComplete ? '#65B863' : '#F87D4D' }}
                >
                  {isPublishing ? (
                    <><RefreshCw size={16} className="animate-spin" /> Publishing...</>
                  ) : (
                    <><Zap size={16} /> Generate &amp; Publish Timetable</>
                  )}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full mb-4" style={{ backgroundColor: '#F7F9FA' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${teacherReadiness?.totalTeachers ? (teacherReadiness.completedTeachers / teacherReadiness.totalTeachers) * 100 : 0}%`,
                  backgroundColor: teacherReadiness?.allComplete ? '#65B863' : '#F87D4D',
                }}
              ></div>
            </div>

            {/* Teacher list */}
            {teacherReadiness && teacherReadiness.teachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacherReadiness.teachers.map((t: any) => (
                  <div key={t.teacherId} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F7F9FA' }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white`}
                      style={{ backgroundColor: t.isComplete ? '#65B863' : '#F87D4D' }}>
                      {t.isComplete ? '✓' : t.teacherName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#1E2333' }}>{t.teacherName}</p>
                      <p className="text-[10px]" style={{ color: '#676D82' }}>
                        {t.division || 'No division'} • {t.boysCount} boys • {t.blockedSlotsCount} blocked slots
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: t.isComplete ? '#F0FDF4' : '#FEF9C3',
                        color: t.isComplete ? '#16A34A' : '#CA8A04',
                      }}>
                      {t.isComplete ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6" style={{ color: '#AFB0B3' }}>
                <p className="text-sm">No teachers registered yet. Teachers can register at <a href="/teacher-admin" className="underline" style={{ color: '#F87D4D' }}>/teacher-admin</a></p>
              </div>
            )}

            {/* Last generation info */}
            {teacherReadiness?.latestGeneration && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: '#EAEDE6' }}>
                <CheckCircle size={14} style={{ color: '#65B863' }} />
                <span className="text-xs" style={{ color: '#676D82' }}>
                  Last published: {new Date(teacherReadiness.latestGeneration.published_at || teacherReadiness.latestGeneration.created_at).toLocaleString()} — {teacherReadiness.latestGeneration.total_lessons} lessons, {teacherReadiness.latestGeneration.total_boys} boys
                </span>
              </div>
            )}

            {/* Publish message */}
            {publishMessage && (
              <div className="mt-4 p-3 rounded-xl text-sm" style={{
                backgroundColor: publishMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: publishMessage.type === 'success' ? '#16A34A' : '#DC2626',
                border: `1px solid ${publishMessage.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
              }}>
                {publishMessage.type === 'success' ? <CheckCircle size={14} className="inline mr-1" /> : <AlertCircle size={14} className="inline mr-1" />}
                {publishMessage.text}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Coach Assignment */}
            <div className="lg:col-span-1 space-y-4">
              {/* Import Methods */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold mb-4" style={{ color: '#1E2333' }}>Import Students</h3>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setImportMethod('text')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2`}
                    style={{
                      backgroundColor: importMethod === 'text' ? '#1E2333' : '#F7F9FA',
                      color: importMethod === 'text' ? '#FFFFFF' : '#676D82'
                    }}
                  >
                    <FileText size={16} />
                    Text
                  </button>
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2`}
                    style={{
                      backgroundColor: importMethod === 'file' ? '#1E2333' : '#F7F9FA',
                      color: importMethod === 'file' ? '#FFFFFF' : '#676D82'
                    }}
                  >
                    <Upload size={16} />
                    File
                  </button>
                  <button
                    onClick={() => setImportMethod('bookings')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2`}
                    style={{
                      backgroundColor: importMethod === 'bookings' ? '#1E2333' : '#F7F9FA',
                      color: importMethod === 'bookings' ? '#FFFFFF' : '#676D82'
                    }}
                  >
                    <Users size={16} />
                    Bookings
                  </button>
                </div>

                {importMethod === 'text' && (
                  <>
                    <select
                      value={selectedCoachForAssignment}
                      onChange={(e) => setSelectedCoachForAssignment(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border mb-3"
                      style={{ borderColor: '#EAEDE6' }}
                    >
                      <option value="">Select Coach</option>
                      {coaches.map(coach => (
                        <option key={coach.id} value={coach.id}>{coach.name} ({coach.students.length} students)</option>
                      ))}
                    </select>
                    <textarea
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      placeholder="Enter student names (one per line)"
                      className="w-full px-4 py-3 rounded-lg border resize-none"
                      style={{ borderColor: '#EAEDE6', minHeight: '100px' }}
                    />
                    <button
                      onClick={addStudentsToCoach}
                      disabled={!selectedCoachForAssignment || !studentInput.trim()}
                      className="w-full mt-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                    >
                      Add Students
                    </button>
                  </>
                )}

                {importMethod === 'file' && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: '#EAEDE6' }}>
                    <Upload size={32} className="mx-auto mb-2" style={{ color: '#AFB0B3' }} />
                    <p className="text-sm mb-2" style={{ color: '#676D82' }}>Drop image or Word doc here</p>
                    <p className="text-xs" style={{ color: '#AFB0B3' }}>Supports .jpg, .png, .docx</p>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.docx" />
                    <button className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}>
                      Browse Files
                    </button>
                  </div>
                )}

                {importMethod === 'bookings' && (
                  <div className="text-center">
                    <p className="text-sm mb-4" style={{ color: '#676D82' }}>
                      Import students from Ludgrove Standard 1-2-1 bookings and distribute evenly across coaches.
                    </p>
                    <button
                      onClick={importFromBookings}
                      className="w-full py-2 rounded-lg font-medium transition-all"
                      style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}
                    >
                      Import from Bookings
                    </button>
                  </div>
                )}
              </div>

              {/* Coaches List */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold mb-4" style={{ color: '#1E2333' }}>Coaches & Students</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {coaches.map(coach => (
                    <div key={coach.id} className="border rounded-lg p-3" style={{ borderColor: '#EAEDE6' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: '#1E2333' }}>{coach.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}>
                          {coach.students.length} students
                        </span>
                      </div>
                      {coach.students.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {coach.students.map(student => (
                            <span 
                              key={student.id}
                              className="text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-red-100"
                              style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                              onClick={() => removeStudent(coach.id, student.id)}
                            >
                              {student.name}
                              <X size={12} />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold" style={{ color: '#1E2333' }}>Constraints</h3>
                  <button
                    onClick={() => setShowConstraintsPanel(!showConstraintsPanel)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Settings size={18} style={{ color: '#676D82' }} />
                  </button>
                </div>
                <div className="space-y-2">
                  {constraints.map(constraint => (
                    <label key={constraint.id} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={constraint.enabled}
                        onChange={() => toggleConstraint(constraint.id)}
                        className="mt-1"
                      />
                      <span className="text-sm" style={{ color: constraint.enabled ? '#1E2333' : '#AFB0B3' }}>
                        {constraint.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateSchedule}
                disabled={isGenerating || totalStudents === 0}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#65B863', color: '#FFFFFF' }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    Generate Timetable
                  </>
                )}
              </button>
            </div>

            {/* Right Panel - Timetable */}
            <div className="lg:col-span-2 space-y-4">
              {/* Schedule Stats Summary */}
              {schedule.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-medium" style={{ color: '#676D82' }}>Total Lessons</p>
                    <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>{scheduleStats.totalLessons}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-medium" style={{ color: '#676D82' }}>Students Scheduled</p>
                    <p className="text-2xl font-bold" style={{ color: '#65B863' }}>{totalStudents - scheduleStats.unscheduledStudents.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-medium" style={{ color: '#676D82' }}>Unscheduled</p>
                    <p className="text-2xl font-bold" style={{ color: scheduleStats.unscheduledStudents.length > 0 ? '#EF4444' : '#65B863' }}>{scheduleStats.unscheduledStudents.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-medium" style={{ color: '#676D82' }}>Avg/Coach</p>
                    <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>{coaches.length > 0 ? (scheduleStats.totalLessons / coaches.length).toFixed(1) : 0}</p>
                  </div>
                </div>
              )}

              {/* Coach utilization bars */}
              {schedule.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold mb-3" style={{ color: '#1E2333' }}>Coach Workload</h4>
                  <div className="space-y-2">
                    {coaches.map(coach => {
                      const lessons = schedule.filter(e => e.coachId === coach.id).length
                      const maxLessons = Math.max(...coaches.map(c => schedule.filter(e => e.coachId === c.id).length), 1)
                      return (
                        <div key={coach.id} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-14 text-right" style={{ color: '#1E2333' }}>{coach.name}</span>
                          <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: '#F7F9FA' }}>
                            <div 
                              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${(lessons / maxLessons) * 100}%`, backgroundColor: coach.color, minWidth: lessons > 0 ? '24px' : '0' }}
                            >
                              <span className="text-[10px] font-bold text-white">{lessons}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Day-by-Day Timetable Grid */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EAEDE6' }}>
                  <h3 className="font-bold" style={{ color: '#1E2333' }}>Weekly Timetable</h3>
                  {schedule.length > 0 && (
                    <button
                      onClick={exportTimetable}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                  )}
                </div>

                {schedule.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4" style={{ color: '#AFB0B3' }} />
                    <p style={{ color: '#676D82' }}>Add students to coaches and click &quot;Generate Timetable&quot; to create the schedule</p>
                  </div>
                ) : (
                  <div className="p-4">
                    {/* Day columns */}
                    <div className="grid grid-cols-5 gap-3">
                      {days.map(day => {
                        const dayEntries = schedule.filter(e => e.day === day)
                        return (
                          <div key={day} className="min-w-0">
                            {/* Day header */}
                            <div className="rounded-t-xl px-3 py-2.5 text-center" style={{ backgroundColor: '#1E2333' }}>
                              <p className="text-sm font-bold text-white">{dayLabels[day]}</p>
                              <p className="text-[10px] text-white/50">{dayEntries.length} lessons</p>
                            </div>

                            {/* Slots */}
                            {slots.map(slot => {
                              const slotEntries = schedule.filter(e => e.day === day && e.slot === slot)
                              const isReduced = constraints.some(c => 
                                c.enabled && c.type === 'reduce_slot' && c.value.day === day && c.value.slot === slot
                              )
                              const isBlocked = constraints.some(c =>
                                c.enabled && c.type === 'reduce_slot' && c.value.day === day && c.value.slot === slot && c.value.reduction === 100
                              )
                              return (
                                <div 
                                  key={`${day}-${slot}`} 
                                  className="border-x border-b px-2 py-2"
                                  style={{ 
                                    borderColor: '#EAEDE6',
                                    backgroundColor: isBlocked ? '#FEE2E2' : isReduced ? '#FEF9C3' : '#FFFFFF',
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#676D82' }}>{slotLabels[slot]}</span>
                                    <span className="text-[9px]" style={{ color: '#AFB0B3' }}>{slotTimes[slot]}</span>
                                  </div>
                                  {isBlocked && slotEntries.length === 0 ? (
                                    <div className="text-[10px] text-center py-1 rounded" style={{ color: '#EF4444', backgroundColor: '#FEE2E230' }}>
                                      No lessons
                                    </div>
                                  ) : slotEntries.length === 0 ? (
                                    <div className="text-[10px] text-center py-1" style={{ color: '#D1D5DB' }}>—</div>
                                  ) : (
                                    <div className="space-y-1">
                                      {slotEntries.map(entry => {
                                        const coach = coaches.find(c => c.id === entry.coachId)
                                        return (
                                          <div 
                                            key={entry.studentId}
                                            className="rounded-lg px-2 py-1.5 flex items-center gap-1.5"
                                            style={{ backgroundColor: coach?.color + '18' }}
                                          >
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: coach?.color }}></div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[11px] font-medium truncate" style={{ color: '#1E2333' }}>{entry.studentName}</p>
                                              <p className="text-[9px] truncate" style={{ color: coach?.color }}>{coach?.name}</p>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4" style={{ borderColor: '#EAEDE6' }}>
                      <span className="text-xs font-medium" style={{ color: '#676D82' }}>Coaches:</span>
                      {coaches.filter(c => schedule.some(e => e.coachId === c.id)).map(coach => (
                        <div key={coach.id} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: coach.color }}></div>
                          <span className="text-xs" style={{ color: '#1E2333' }}>{coach.name}</span>
                        </div>
                      ))}
                      <span className="mx-2 text-xs" style={{ color: '#D1D5DB' }}>|</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE68A' }}></div>
                        <span className="text-xs" style={{ color: '#676D82' }}>Reduced</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}></div>
                        <span className="text-xs" style={{ color: '#676D82' }}>Blocked</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
