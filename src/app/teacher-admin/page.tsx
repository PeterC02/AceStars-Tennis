'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LogIn, LogOut, Upload, Users, Calendar, Clock, MapPin,
  Plus, X, Trash2, Edit3, Download, RefreshCw, ChevronDown,
  ChevronRight, CheckCircle, AlertCircle, FileText, Search,
  GraduationCap, BookOpen, Star, Eye, EyeOff, UserPlus,
  Settings, BarChart3, Zap, Info, Shield
} from 'lucide-react'

// Types
type Teacher = {
  id: string
  name: string
  email: string
  division: string | null
}

type Boy = {
  id: string
  name: string
  year_group: string | null
  division: string | null
  coach_preference: string | null
  lessons_per_week: number
  notes: string | null
  boy_blocked_slots: BlockedSlot[]
}

type BlockedSlot = {
  id: string
  boy_id: string
  day: string
  slot: string
  school_lesson: string | null
  term: string
}

type ScheduleEntry = {
  boyId: string
  boyName: string
  coachId: string
  coachName: string
  coachColor: string
  day: string
  slot: string
  isLocked: boolean
}

type Coach = {
  id: string
  name: string
  color: string
}

type ScheduleStats = {
  totalLessons: number
  totalBoys: number
  unscheduledBoys: { name: string; needed: number; scheduled: number }[]
  coachUtilization: Record<string, number>
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const
const DAY_LABELS: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' }
const DAY_SHORT: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' }
const SLOTS = ['breakfast', 'fruit', 'rest'] as const
const SLOT_LABELS: Record<string, string> = { breakfast: 'Breakfast', fruit: 'Fruit', rest: 'Rest' }
const SLOT_TIMES: Record<string, string> = { breakfast: '8:05–8:35am', fruit: '10:55–11:25am', rest: '1:55–2:20pm' }

const TERMS = ['Spring 2026', 'Summer 2026', 'Autumn 2026', 'Spring 2027']

export default function TeacherAdminPage() {
  // Auth state
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'coach'>('login')
  const [isCoach, setIsCoach] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', pin: '', division: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // App state
  const [activeTab, setActiveTab] = useState<'boys' | 'upload' | 'schedule'>('boys')
  const [term, setTerm] = useState('Summer 2026')
  const [boys, setBoys] = useState<Boy[]>([])
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [stats, setStats] = useState<ScheduleStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isUploadComplete, setIsUploadComplete] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)

  // Boy form
  const [showAddBoy, setShowAddBoy] = useState(false)
  const [boyForm, setBoyForm] = useState({ name: '', yearGroup: '', division: '', coachPreference: '', lessonsPerWeek: 2, notes: '' })
  const [editingBoyId, setEditingBoyId] = useState<string | null>(null)

  // Upload state
  const [csvText, setCsvText] = useState('')
  const [uploadResults, setUploadResults] = useState<any[] | null>(null)

  // Manual blocked slot editing
  const [editingBlockedBoyId, setEditingBlockedBoyId] = useState<string | null>(null)

  // Schedule view
  const [scheduleView, setScheduleView] = useState<'grid' | 'list'>('grid')
  const [scheduleFilter, setScheduleFilter] = useState('')

  // Persist auth
  useEffect(() => {
    const saved = localStorage.getItem('teacher-auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTeacher(parsed)
        if (parsed.id === 'coach-account') setIsCoach(true)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (teacher) {
      localStorage.setItem('teacher-auth', JSON.stringify(teacher))
    } else {
      localStorage.removeItem('teacher-auth')
    }
  }, [teacher])

  const fetchBoys = useCallback(async () => {
    if (!teacher) return
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/boys?divMasterId=${teacher.id}`)
      const data = await res.json()
      setBoys(data.boys || [])
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }, [teacher])

  // Fetch boys when teacher logs in or term changes
  useEffect(() => {
    if (teacher) fetchBoys()
  }, [teacher, term, fetchBoys])

  const fetchSchedule = useCallback(async () => {
    if (!teacher) return
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/schedule?term=${encodeURIComponent(term)}`)
      const data = await res.json()
      setSchedule(data.schedule || [])
      setCoaches(data.coaches || [])
      setIsPublished(data.isPublished || false)
      setPublishedAt(data.publishedAt || null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }, [teacher, term])

  // Fetch upload completion status
  const fetchUploadStatus = useCallback(async () => {
    if (!teacher) return
    try {
      const res = await fetch(`/api/teacher/readiness?term=${encodeURIComponent(term)}`)
      const data = await res.json()
      const myStatus = (data.teachers || []).find((t: any) => t.teacherId === teacher.id)
      setIsUploadComplete(myStatus?.isComplete || false)
    } catch {}
  }, [teacher, term])

  useEffect(() => {
    if (teacher) fetchUploadStatus()
  }, [teacher, term, fetchUploadStatus])

  useEffect(() => {
    if (teacher && activeTab === 'schedule') fetchSchedule()
  }, [teacher, activeTab, term, fetchSchedule])

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    // Coach login — fixed PIN, no DB
    if (authMode === 'coach') {
      if (authForm.pin === '2026') {
        setTeacher({ id: 'coach-account', name: 'Coach', email: 'coach@acestars.co.uk', division: null })
        setIsCoach(true)
        setActiveTab('schedule')
        setAuthForm({ name: '', email: '', pin: '', division: '' })
      } else {
        setAuthError('Incorrect coach PIN')
      }
      setAuthLoading(false)
      return
    }

    // Div master login / register
    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          email: authForm.email,
          pin: authForm.pin,
          name: authForm.name,
          division: authForm.division,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeacher(data.teacher)
      setIsCoach(false)
      setAuthForm({ name: '', email: '', pin: '', division: '' })
    } catch (err: any) {
      setAuthError(err.message)
    }
    setAuthLoading(false)
  }

  const handleLogout = () => {
    setTeacher(null)
    setBoys([])
    setSchedule([])
    setStats(null)
  }

  // Boy CRUD
  const handleAddBoy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacher) return

    try {
      const endpoint = editingBoyId ? '/api/teacher/boys' : '/api/teacher/boys'
      const method = editingBoyId ? 'PUT' : 'POST'
      const body = editingBoyId
        ? { id: editingBoyId, ...boyForm }
        : { ...boyForm, divMasterId: teacher.id }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: editingBoyId ? 'Boy updated' : 'Boy added' })
      setShowAddBoy(false)
      setEditingBoyId(null)
      setBoyForm({ name: '', yearGroup: '', division: '', coachPreference: '', lessonsPerWeek: 2, notes: '' })
      fetchBoys()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handleDeleteBoy = async (id: string) => {
    if (!confirm('Remove this boy?')) return
    try {
      const res = await fetch(`/api/teacher/boys?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setMessage({ type: 'success', text: 'Boy removed' })
      fetchBoys()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const startEditBoy = (boy: Boy) => {
    setBoyForm({
      name: boy.name,
      yearGroup: boy.year_group || '',
      division: boy.division || '',
      coachPreference: boy.coach_preference || '',
      lessonsPerWeek: boy.lessons_per_week,
      notes: boy.notes || '',
    })
    setEditingBoyId(boy.id)
    setShowAddBoy(true)
  }

  // Toggle blocked slot manually
  const toggleBlockedSlot = async (boyId: string, day: string, slot: string) => {
    const boy = boys.find(b => b.id === boyId)
    if (!boy) return

    const existing = boy.boy_blocked_slots?.find(bs => bs.day === day && bs.slot === slot && bs.term === term)
    const currentBlocked = (boy.boy_blocked_slots || []).filter(bs => bs.term === term)

    let newBlocked
    if (existing) {
      newBlocked = currentBlocked.filter(bs => !(bs.day === day && bs.slot === slot))
    } else {
      newBlocked = [...currentBlocked, { day, slot, schoolLesson: 'School Lesson' }]
    }

    try {
      const res = await fetch('/api/teacher/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_blocked_slots',
          boyId,
          term,
          uploadedBy: teacher?.id,
          blockedSlots: newBlocked.map(bs => ({
            day: bs.day,
            slot: bs.slot,
            schoolLesson: ('school_lesson' in bs ? bs.school_lesson : (bs as any).schoolLesson) || 'School Lesson',
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      fetchBoys()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  // CSV Upload
  const handleCsvUpload = async () => {
    if (!csvText.trim() || !teacher) return
    setLoading(true)
    setUploadResults(null)

    try {
      const res = await fetch('/api/teacher/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_csv',
          csvData: csvText,
          term,
          divMasterId: teacher.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUploadResults(data.results)
      setMessage({ type: 'success', text: `Timetable processed for ${data.results.length} boys` })
      fetchBoys()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string || '')
    }
    reader.readAsText(file)
  }

  // Mark upload as complete
  const handleMarkComplete = async () => {
    if (!teacher) return
    try {
      const res = await fetch('/api/teacher/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isUploadComplete ? 'mark_incomplete' : 'mark_complete',
          divMasterId: teacher.id,
          term,
        }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setIsUploadComplete(!isUploadComplete)
      setMessage({ type: 'success', text: isUploadComplete ? 'Upload marked as in progress' : 'Upload marked as complete — the admin will generate the timetable once all teachers are ready' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  // Export schedule CSV
  const exportScheduleCSV = () => {
    let csv = 'Coach,Day,Slot,Time,Boy\n'
    schedule.forEach(entry => {
      csv += `${entry.coachName},${DAY_LABELS[entry.day]},${SLOT_LABELS[entry.slot]},${SLOT_TIMES[entry.slot]},${entry.boyName}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ludgrove-tennis-${term.replace(/\s/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get schedule entry for grid
  const getGridEntries = (coachId: string, day: string, slot: string) => {
    return schedule.filter(e => e.coachId === coachId && e.day === day && e.slot === slot)
  }

  // Filtered schedule
  const filteredSchedule = useMemo(() => {
    if (!scheduleFilter) return schedule
    const q = scheduleFilter.toLowerCase()
    return schedule.filter(e =>
      e.boyName.toLowerCase().includes(q) ||
      e.coachName.toLowerCase().includes(q)
    )
  }, [schedule, scheduleFilter])

  // Clear message after 5s
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [message])

  // ─── LOGIN SCREEN ───
  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E2333 0%, #2a3050 50%, #1E2333 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 w-full max-w-md mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{
              backgroundColor: authMode === 'coach' ? 'rgba(101,184,99,0.15)' : 'rgba(248,125,77,0.15)',
              border: `1px solid ${authMode === 'coach' ? 'rgba(101,184,99,0.2)' : 'rgba(248,125,77,0.2)'}`,
            }}>
              {authMode === 'coach'
                ? <Star size={28} style={{ color: '#65B863' }} />
                : <GraduationCap size={28} style={{ color: '#F87D4D' }} />
              }
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">
              {authMode === 'coach' ? 'Coach Portal' : 'Div Master Portal'}
            </h1>
            <p className="text-sm mt-2" style={{ color: '#AFB0B3' }}>
              {authMode === 'coach' ? 'View the published tennis timetable' : 'Upload timetables and manage tennis scheduling'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden mb-6" style={{ backgroundColor: '#F7F9FA' }}>
              <button
                onClick={() => { setAuthMode('login'); setAuthError('') }}
                className="flex-1 py-3 text-xs font-bold transition-all"
                style={{
                  backgroundColor: authMode === 'login' ? '#F87D4D' : 'transparent',
                  color: authMode === 'login' ? '#FFF' : '#676D82',
                }}
              >
                Div Master
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError('') }}
                className="flex-1 py-3 text-xs font-bold transition-all"
                style={{
                  backgroundColor: authMode === 'register' ? '#F87D4D' : 'transparent',
                  color: authMode === 'register' ? '#FFF' : '#676D82',
                }}
              >
                Register
              </button>
              <button
                onClick={() => { setAuthMode('coach'); setAuthError('') }}
                className="flex-1 py-3 text-xs font-bold transition-all"
                style={{
                  backgroundColor: authMode === 'coach' ? '#65B863' : 'transparent',
                  color: authMode === 'coach' ? '#FFF' : '#676D82',
                }}
              >
                Coach
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'coach' ? (
                <>
                  <p className="text-sm text-center" style={{ color: '#676D82' }}>Enter the coach PIN to view the published timetable</p>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Coach PIN</label>
                    <input
                      type="password" required value={authForm.pin}
                      onChange={e => setAuthForm({ ...authForm, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863] text-center text-2xl tracking-widest"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                      placeholder="••••"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>
                </>
              ) : (
                <>
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Full Name</label>
                        <input
                          type="text" required value={authForm.name}
                          onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                          placeholder="Mr. Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Division / Form</label>
                        <input
                          type="text" value={authForm.division}
                          onChange={e => setAuthForm({ ...authForm, division: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                          placeholder="e.g. Year 5 Division A"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Email Address</label>
                    <input
                      type="email" required value={authForm.email}
                      onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#F87D4D]"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                      placeholder="teacher@ludgrove.co.uk"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>PIN (4-6 digits)</label>
                    <input
                      type="password" required value={authForm.pin}
                      onChange={e => setAuthForm({ ...authForm, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#F87D4D]"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                      placeholder="••••"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>
                </>
              )}

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <AlertCircle size={16} />
                  {authError}
                </div>
              )}

              <button
                type="submit" disabled={authLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
                style={{ backgroundColor: authMode === 'coach' ? '#65B863' : '#F87D4D' }}
              >
                {authLoading ? 'Please wait...' : authMode === 'coach' ? 'View Schedule' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t" style={{ borderColor: '#EAEDE6' }}>
              <div className="flex items-center justify-center gap-4">
                <Link href="/admin" className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: '#dfd300' }}>
                  <Shield size={12} /> Admin Dashboard
                </Link>
                <span className="text-xs" style={{ color: '#EAEDE6' }}>|</span>
                <Link href="/" className="text-xs font-medium hover:underline" style={{ color: '#676D82' }}>
                  Back to Site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN APP ───
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F9FA' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#1E2333' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/images/logo-white.png" alt="Acestars" width={100} height={53} />
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: isCoach ? 'rgba(101,184,99,0.2)' : 'rgba(248,125,77,0.2)' }}>
              {isCoach ? <Star size={12} style={{ color: '#65B863' }} /> : <GraduationCap size={12} style={{ color: '#F87D4D' }} />}
              <span className="text-xs font-bold" style={{ color: isCoach ? '#65B863' : '#F87D4D' }}>{isCoach ? 'Coach Portal' : 'Div Master Portal'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Term selector */}
            <select
              value={term}
              onChange={e => setTerm(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border-0 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF' }}
            >
              {TERMS.map(t => <option key={t} value={t} style={{ color: '#1E2333' }}>{t}</option>)}
            </select>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#F87D4D', color: '#FFF' }}>
                {teacher.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white">{teacher.name}</p>
                <p className="text-[10px]" style={{ color: '#AFB0B3' }}>{teacher.division || 'Div Master'}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="p-2 rounded-lg transition-all hover:bg-white/10" title="Sign out">
              <LogOut size={16} style={{ color: '#AFB0B3' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Toast message */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
            style={{
              backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: message.type === 'success' ? '#16A34A' : '#DC2626',
              border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-2"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b" style={{ borderColor: '#EAEDE6', backgroundColor: '#FFF' }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            ...(!isCoach ? [
              { key: 'boys' as const, label: 'My Boys', icon: Users, count: boys.length },
              { key: 'upload' as const, label: 'Upload Timetable', icon: Upload },
            ] : []),
            { key: 'schedule' as const, label: 'Tennis Schedule', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2"
              style={{
                borderColor: activeTab === tab.key ? '#F87D4D' : 'transparent',
                color: activeTab === tab.key ? '#F87D4D' : '#676D82',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: activeTab === tab.key ? 'rgba(248,125,77,0.15)' : '#F7F9FA',
                    color: activeTab === tab.key ? '#F87D4D' : '#676D82',
                  }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ─── BOYS TAB ─── */}
        {activeTab === 'boys' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-heading" style={{ color: '#1E2333' }}>My Boys</h2>
                <p className="text-sm" style={{ color: '#676D82' }}>Manage boys in your division and their blocked school slots</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkComplete}
                  disabled={boys.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: isUploadComplete ? '#676D82' : '#65B863', color: '#FFF' }}
                >
                  {isUploadComplete ? <CheckCircle size={16} /> : <Upload size={16} />}
                  {isUploadComplete ? 'Upload Complete ✓' : 'Mark Upload Complete'}
                </button>
                <button
                  onClick={() => { setShowAddBoy(true); setEditingBoyId(null); setBoyForm({ name: '', yearGroup: '', division: '', coachPreference: '', lessonsPerWeek: 2, notes: '' }) }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ backgroundColor: '#F87D4D', color: '#FFF' }}
                >
                  <Plus size={16} />
                  Add Boy
                </button>
              </div>
            </div>

            {/* Add/Edit Boy Modal */}
            {showAddBoy && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-lg mx-4 rounded-2xl shadow-2xl p-6" style={{ backgroundColor: '#FFF' }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold" style={{ color: '#1E2333' }}>
                      {editingBoyId ? 'Edit Boy' : 'Add New Boy'}
                    </h3>
                    <button onClick={() => { setShowAddBoy(false); setEditingBoyId(null) }}><X size={20} style={{ color: '#676D82' }} /></button>
                  </div>
                  <form onSubmit={handleAddBoy} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold mb-1" style={{ color: '#1E2333' }}>Name *</label>
                        <input type="text" required value={boyForm.name}
                          onChange={e => setBoyForm({ ...boyForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6' }} placeholder="e.g. James Smith" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: '#1E2333' }}>Year Group</label>
                        <input type="text" value={boyForm.yearGroup}
                          onChange={e => setBoyForm({ ...boyForm, yearGroup: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6' }} placeholder="e.g. Year 5" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: '#1E2333' }}>Division</label>
                        <input type="text" value={boyForm.division}
                          onChange={e => setBoyForm({ ...boyForm, division: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6' }} placeholder="e.g. Division A" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: '#1E2333' }}>Coach Preference</label>
                        <select value={boyForm.coachPreference}
                          onChange={e => setBoyForm({ ...boyForm, coachPreference: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6' }}>
                          <option value="">No preference</option>
                          {['peter', 'wojtek', 'ollie', 'tom', 'andy', 'jake', 'james'].map(c => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1" style={{ color: '#1E2333' }}>Lessons/Week</label>
                        <select value={boyForm.lessonsPerWeek}
                          onChange={e => setBoyForm({ ...boyForm, lessonsPerWeek: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-[#F87D4D]"
                          style={{ borderColor: '#EAEDE6' }}>
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold mb-1" style={{ color: '#1E2333' }}>Notes</label>
                        <textarea value={boyForm.notes}
                          onChange={e => setBoyForm({ ...boyForm, notes: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-[#F87D4D] resize-none"
                          style={{ borderColor: '#EAEDE6' }} rows={2} placeholder="Any additional notes..." />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => { setShowAddBoy(false); setEditingBoyId(null) }}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}>
                        Cancel
                      </button>
                      <button type="submit"
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: '#F87D4D' }}>
                        {editingBoyId ? 'Save Changes' : 'Add Boy'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Boys List with Blocked Slots Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw size={24} className="animate-spin" style={{ color: '#F87D4D' }} />
              </div>
            ) : boys.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: '#FFF', border: '2px dashed #EAEDE6' }}>
                <Users size={48} className="mx-auto mb-4" style={{ color: '#EAEDE6' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>No boys added yet</h3>
                <p className="text-sm mb-4" style={{ color: '#676D82' }}>Add boys from your division to start managing their tennis schedule</p>
                <button
                  onClick={() => setShowAddBoy(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ backgroundColor: '#F87D4D' }}
                >
                  <Plus size={16} /> Add First Boy
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {boys.map(boy => {
                  const blockedForTerm = (boy.boy_blocked_slots || []).filter(bs => bs.term === term)
                  const isEditing = editingBlockedBoyId === boy.id

                  return (
                    <div key={boy.id} className="rounded-2xl overflow-hidden transition-all hover:shadow-md" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                      <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: 'rgba(248,125,77,0.15)', color: '#F87D4D' }}>
                            {boy.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm" style={{ color: '#1E2333' }}>{boy.name}</h4>
                            <div className="flex items-center gap-3 mt-0.5">
                              {boy.year_group && <span className="text-xs" style={{ color: '#676D82' }}>{boy.year_group}</span>}
                              {boy.division && <span className="text-xs" style={{ color: '#676D82' }}>• {boy.division}</span>}
                              <span className="text-xs" style={{ color: '#676D82' }}>• {boy.lessons_per_week} lesson{boy.lessons_per_week !== 1 ? 's' : ''}/week</span>
                              {boy.coach_preference && (
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(101,184,99,0.15)', color: '#65B863' }}>
                                  Coach: {boy.coach_preference.charAt(0).toUpperCase() + boy.coach_preference.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: blockedForTerm.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(101,184,99,0.1)',
                              color: blockedForTerm.length > 0 ? '#EF4444' : '#65B863',
                            }}>
                            {blockedForTerm.length} blocked
                          </span>
                          <button onClick={() => setEditingBlockedBoyId(isEditing ? null : boy.id)}
                            className="p-2 rounded-lg transition-all hover:bg-gray-100" title="Edit blocked slots">
                            {isEditing ? <EyeOff size={16} style={{ color: '#676D82' }} /> : <Eye size={16} style={{ color: '#676D82' }} />}
                          </button>
                          <button onClick={() => startEditBoy(boy)}
                            className="p-2 rounded-lg transition-all hover:bg-gray-100" title="Edit boy">
                            <Edit3 size={16} style={{ color: '#676D82' }} />
                          </button>
                          <button onClick={() => handleDeleteBoy(boy.id)}
                            className="p-2 rounded-lg transition-all hover:bg-red-50" title="Remove boy">
                            <Trash2 size={16} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      </div>

                      {/* Blocked Slots Grid */}
                      {isEditing && (
                        <div className="px-5 pb-5 border-t" style={{ borderColor: '#EAEDE6' }}>
                          <div className="flex items-center gap-2 mt-3 mb-3">
                            <Info size={14} style={{ color: '#3B82F6' }} />
                            <span className="text-xs" style={{ color: '#3B82F6' }}>
                              Click cells to mark when {boy.name} has a school lesson (red = blocked, cannot play tennis)
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr>
                                  <th className="text-left py-2 px-3 font-bold" style={{ color: '#676D82' }}></th>
                                  {DAYS.map(d => (
                                    <th key={d} className="text-center py-2 px-3 font-bold" style={{ color: '#676D82' }}>{DAY_SHORT[d]}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {SLOTS.map(slot => (
                                  <tr key={slot}>
                                    <td className="py-1.5 px-3 font-bold whitespace-nowrap" style={{ color: '#1E2333' }}>
                                      {SLOT_LABELS[slot]}
                                      <span className="font-normal ml-1" style={{ color: '#AFB0B3' }}>({SLOT_TIMES[slot]})</span>
                                    </td>
                                    {DAYS.map(d => {
                                      const blocked = blockedForTerm.find(bs => bs.day === d && bs.slot === slot)
                                      return (
                                        <td key={d} className="py-1.5 px-1 text-center">
                                          <button
                                            onClick={() => toggleBlockedSlot(boy.id, d, slot)}
                                            className="w-full py-2.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                                            style={{
                                              backgroundColor: blocked ? '#FEE2E2' : '#F0FDF4',
                                              color: blocked ? '#DC2626' : '#16A34A',
                                              border: `1px solid ${blocked ? '#FECACA' : '#BBF7D0'}`,
                                            }}
                                          >
                                            {blocked ? (blocked.school_lesson || 'Blocked') : 'Free'}
                                          </button>
                                        </td>
                                      )
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── UPLOAD TAB ─── */}
        {activeTab === 'upload' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold font-heading" style={{ color: '#1E2333' }}>Upload School Timetable</h2>
              <p className="text-sm" style={{ color: '#676D82' }}>
                Upload a CSV of boys&apos; school timetables. The system will automatically detect which tennis slots are blocked.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: '#1E2333' }}>
                  <Upload size={16} className="inline mr-2" style={{ color: '#F87D4D' }} />
                  Upload CSV File
                </h3>

                <div className="mb-4">
                  <label className="flex items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all hover:border-[#F87D4D]"
                    style={{ border: '2px dashed #EAEDE6', backgroundColor: '#F7F9FA' }}>
                    <FileText size={24} style={{ color: '#676D82' }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#1E2333' }}>Click to upload CSV</p>
                      <p className="text-xs" style={{ color: '#676D82' }}>or paste data below</p>
                    </div>
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Or paste CSV data</label>
                  <textarea
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-xs font-mono border-2 outline-none focus:border-[#F87D4D] resize-none"
                    style={{ borderColor: '#EAEDE6', minHeight: '200px' }}
                    placeholder={`Boy Name, Mon 08:00-08:40, Mon 10:50-11:30, Mon 13:50-14:25, Tue 08:00-08:40, ...
James Smith, Maths, , English, Science, ...
Oliver Brown, , History, , Maths, ...`}
                  />
                </div>

                <button
                  onClick={handleCsvUpload}
                  disabled={!csvText.trim() || loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ backgroundColor: '#F87D4D' }}
                >
                  {loading ? 'Processing...' : 'Process Timetable'}
                </button>

                {/* Upload Results */}
                {uploadResults && (
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <h4 className="font-bold text-sm mb-2" style={{ color: '#16A34A' }}>
                      <CheckCircle size={14} className="inline mr-1" /> Upload Complete
                    </h4>
                    <div className="space-y-1">
                      {uploadResults.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span style={{ color: '#1E2333' }}>{r.boyName}</span>
                          <span className="font-bold" style={{ color: r.blockedCount > 0 ? '#EF4444' : '#16A34A' }}>
                            {r.blockedCount} blocked slot{r.blockedCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Format Guide */}
              <div className="space-y-4">
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                  <h3 className="font-bold text-sm mb-3" style={{ color: '#1E2333' }}>
                    <BookOpen size={16} className="inline mr-2" style={{ color: '#3B82F6' }} />
                    CSV Format Guide
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: '#F87D4D' }}>Format 1: Time-based columns</p>
                      <div className="p-3 rounded-lg font-mono text-[10px] leading-relaxed overflow-x-auto" style={{ backgroundColor: '#F7F9FA' }}>
                        <p style={{ color: '#676D82' }}>Boy Name, Mon 08:00-08:40, Mon 10:50-11:30, Mon 13:50-14:25, Tue 08:00-08:40, ...</p>
                        <p style={{ color: '#1E2333' }}>James Smith, Maths, , English, Science, ...</p>
                        <p style={{ color: '#1E2333' }}>Oliver Brown, , History, , Maths, ...</p>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: '#676D82' }}>Empty cells = free period. Filled cells = school lesson (blocks tennis).</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: '#F87D4D' }}>Format 2: Row-based</p>
                      <div className="p-3 rounded-lg font-mono text-[10px] leading-relaxed overflow-x-auto" style={{ backgroundColor: '#F7F9FA' }}>
                        <p style={{ color: '#676D82' }}>Boy Name, Day, Time Start, Time End, Lesson</p>
                        <p style={{ color: '#1E2333' }}>James Smith, Monday, 08:00, 08:40, Maths</p>
                        <p style={{ color: '#1E2333' }}>James Smith, Monday, 13:50, 14:25, English</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                  <h3 className="font-bold text-sm mb-3" style={{ color: '#1E2333' }}>
                    <Clock size={16} className="inline mr-2" style={{ color: '#65B863' }} />
                    Tennis Slot Times
                  </h3>
                  <div className="space-y-2">
                    {SLOTS.map(slot => (
                      <div key={slot} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F7F9FA' }}>
                        <span className="text-sm font-bold" style={{ color: '#1E2333' }}>{SLOT_LABELS[slot]}</span>
                        <span className="text-sm" style={{ color: '#676D82' }}>{SLOT_TIMES[slot]}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] mt-3" style={{ color: '#AFB0B3' }}>
                    If a boy has a school lesson overlapping any of these times, that tennis slot is automatically blocked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCHEDULE TAB ─── */}
        {activeTab === 'schedule' && (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold font-heading" style={{ color: '#1E2333' }}>Tennis Schedule — {term}</h2>
                <p className="text-sm" style={{ color: '#676D82' }}>
                  {schedule.length} lessons scheduled across {coaches.length} coaches
                  {isPublished && publishedAt && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                      Published {new Date(publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#AFB0B3' }} />
                  <input
                    type="text" value={scheduleFilter}
                    onChange={e => setScheduleFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl text-xs border-2 outline-none focus:border-[#F87D4D] w-48"
                    style={{ borderColor: '#EAEDE6' }}
                    placeholder="Search boy or coach..."
                  />
                </div>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #EAEDE6' }}>
                  <button onClick={() => setScheduleView('grid')}
                    className="px-3 py-2 text-xs font-bold"
                    style={{ backgroundColor: scheduleView === 'grid' ? '#F87D4D' : '#FFF', color: scheduleView === 'grid' ? '#FFF' : '#676D82' }}>
                    Grid
                  </button>
                  <button onClick={() => setScheduleView('list')}
                    className="px-3 py-2 text-xs font-bold"
                    style={{ backgroundColor: scheduleView === 'list' ? '#F87D4D' : '#FFF', color: scheduleView === 'list' ? '#FFF' : '#676D82' }}>
                    List
                  </button>
                </div>
                <button onClick={fetchSchedule}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white"
                  style={{ backgroundColor: '#65B863' }}>
                  <RefreshCw size={14} />
                  Refresh
                </button>
                <button onClick={exportScheduleCSV} disabled={schedule.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs disabled:opacity-50"
                  style={{ backgroundColor: '#F7F9FA', color: '#676D82', border: '1px solid #EAEDE6' }}>
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                  <p className="text-xs font-bold" style={{ color: '#676D82' }}>Total Lessons</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>{stats.totalLessons}</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                  <p className="text-xs font-bold" style={{ color: '#676D82' }}>Boys Scheduled</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>{stats.totalBoys}</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: stats.unscheduledBoys.length > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${stats.unscheduledBoys.length > 0 ? '#FECACA' : '#BBF7D0'}` }}>
                  <p className="text-xs font-bold" style={{ color: '#676D82' }}>Unscheduled</p>
                  <p className="text-2xl font-bold" style={{ color: stats.unscheduledBoys.length > 0 ? '#DC2626' : '#16A34A' }}>
                    {stats.unscheduledBoys.length}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                  <p className="text-xs font-bold" style={{ color: '#676D82' }}>Coaches Active</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>
                    {Object.values(stats.coachUtilization).filter(v => v > 0).length}
                  </p>
                </div>
              </div>
            )}

            {/* Unscheduled warnings */}
            {stats && stats.unscheduledBoys.length > 0 && (
              <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} style={{ color: '#DC2626' }} />
                  <span className="text-sm font-bold" style={{ color: '#DC2626' }}>
                    {stats.unscheduledBoys.length} boy{stats.unscheduledBoys.length !== 1 ? 's' : ''} could not be fully scheduled
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.unscheduledBoys.map((b, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FFF', color: '#DC2626' }}>
                      {b.name} ({b.scheduled}/{b.needed})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {schedule.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: '#FFF', border: '2px dashed #EAEDE6' }}>
                <Calendar size={48} className="mx-auto mb-4" style={{ color: '#EAEDE6' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>No schedule published yet</h3>
                <p className="text-sm mb-4" style={{ color: '#676D82' }}>
                  {isCoach ? 'The admin has not yet published a timetable. Check back later.' : 'Once all teachers have uploaded their timetables and marked complete, the admin will generate and publish the schedule'}
                </p>
                {!isCoach && (
                  <button onClick={() => setActiveTab('boys')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ backgroundColor: '#F87D4D' }}>
                    <Upload size={16} /> Upload Timetables
                  </button>
                )}
              </div>
            ) : scheduleView === 'grid' ? (
              /* Grid View - Coach × Day/Slot */
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: '#1E2333' }}>
                        <th className="text-left py-3 px-4 font-bold text-white sticky left-0" style={{ backgroundColor: '#1E2333', minWidth: '100px' }}>Coach</th>
                        {DAYS.map(d => (
                          SLOTS.map(s => (
                            <th key={`${d}-${s}`} className="text-center py-3 px-2 font-bold text-white" style={{ minWidth: '90px' }}>
                              <div>{DAY_SHORT[d]}</div>
                              <div className="font-normal text-[10px]" style={{ color: '#AFB0B3' }}>{SLOT_LABELS[s]}</div>
                            </th>
                          ))
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {coaches.filter(c => filteredSchedule.some(e => e.coachId === c.id)).map((coach, ci) => (
                        <tr key={coach.id} style={{ backgroundColor: ci % 2 === 0 ? '#FFF' : '#FAFBFC' }}>
                          <td className="py-2 px-4 font-bold sticky left-0" style={{ backgroundColor: ci % 2 === 0 ? '#FFF' : '#FAFBFC' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: coach.color }}></div>
                              <span style={{ color: '#1E2333' }}>{coach.name}</span>
                            </div>
                          </td>
                          {DAYS.map(d => (
                            SLOTS.map(s => {
                              const entries = getGridEntries(coach.id, d, s).filter(e =>
                                !scheduleFilter || e.boyName.toLowerCase().includes(scheduleFilter.toLowerCase())
                              )
                              return (
                                <td key={`${d}-${s}`} className="py-1.5 px-1 text-center">
                                  {entries.length > 0 ? (
                                    <div className="space-y-0.5">
                                      {entries.map((entry, i) => (
                                        <div key={i} className="px-2 py-1.5 rounded-lg text-[10px] font-bold truncate"
                                          style={{ backgroundColor: `${coach.color}20`, color: coach.color, border: `1px solid ${coach.color}40` }}>
                                          {entry.boyName}
                                          {entry.isLocked && <span className="ml-1">🔒</span>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-1.5 text-[10px]" style={{ color: '#EAEDE6' }}>—</div>
                                  )}
                                </td>
                              )
                            })
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredSchedule.map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 rounded-xl" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.coachColor }}></div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm" style={{ color: '#1E2333' }}>{entry.boyName}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: entry.coachColor }}>{entry.coachName}</span>
                    <span className="text-xs" style={{ color: '#676D82' }}>{DAY_LABELS[entry.day]}</span>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7F9FA', color: '#1E2333' }}>
                      {SLOT_LABELS[entry.slot]} ({SLOT_TIMES[entry.slot]})
                    </span>
                    {entry.isLocked && <span className="text-xs">🔒</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Coach Utilization */}
            {stats && schedule.length > 0 && (
              <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: '#1E2333' }}>
                  <BarChart3 size={16} className="inline mr-2" style={{ color: '#F87D4D' }} />
                  Coach Utilization
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {coaches.map(coach => {
                    const lessons = stats.coachUtilization[coach.name] || 0
                    const maxLessons = 15 // 5 days × 3 slots
                    const pct = Math.round((lessons / maxLessons) * 100)
                    return (
                      <div key={coach.id} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F7F9FA' }}>
                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: coach.color }}>
                          {coach.name.charAt(0)}
                        </div>
                        <p className="text-xs font-bold" style={{ color: '#1E2333' }}>{coach.name}</p>
                        <p className="text-lg font-bold" style={{ color: coach.color }}>{lessons}</p>
                        <div className="w-full h-1.5 rounded-full mt-1" style={{ backgroundColor: '#EAEDE6' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: coach.color }}></div>
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: '#AFB0B3' }}>{pct}%</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
