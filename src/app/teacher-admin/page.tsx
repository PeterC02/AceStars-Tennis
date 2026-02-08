'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LogIn, LogOut, Upload, Users, Calendar, Clock, MapPin,
  Plus, X, Trash2, Edit3, Download, RefreshCw, ChevronDown,
  ChevronRight, CheckCircle, AlertCircle, FileText, Search,
  GraduationCap, BookOpen, Star, Eye, EyeOff, UserPlus,
  Settings, BarChart3, Zap, Info, Shield, Camera, ArrowRight, ImageIcon, Mail
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
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

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

  // Photo upload sequential flow state
  const [selectedBoyForUpload, setSelectedBoyForUpload] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    // Coach login — server-side PIN validation
    if (authMode === 'coach') {
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', pin: authForm.pin, role: 'coach' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        if (data.role === 'coach') {
          setTeacher({ id: 'coach-account', name: 'Coach', email: 'coach@acestars.co.uk', division: null })
          setIsCoach(true)
          setActiveTab('schedule')
          setAuthForm({ name: '', email: '', pin: '', division: '' })
          localStorage.setItem('coach-auth-token', data.token)
        } else {
          setAuthError('This PIN is not for coach access')
        }
      } catch (err: any) {
        setAuthError(err.message)
      }
      setAuthLoading(false)
      return
    }

    // Div master login / register — Step 1: validate credentials, send verification code
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

      if (data.requiresVerification) {
        setVerificationStep(true)
        setVerificationEmail(authForm.email)
        setVerificationCode('')
        setResendCooldown(60)
      } else if (data.teacher) {
        setTeacher(data.teacher)
        setIsCoach(false)
        setAuthForm({ name: '', email: '', pin: '', division: '' })
      }
    } catch (err: any) {
      setAuthError(err.message)
    }
    setAuthLoading(false)
  }

  // Step 2: Verify email code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', email: verificationEmail, code: verificationCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeacher(data.teacher)
      setIsCoach(false)
      setAuthForm({ name: '', email: '', pin: '', division: '' })
      setVerificationStep(false)
      setVerificationCode('')
    } catch (err: any) {
      setAuthError(err.message)
    }
    setAuthLoading(false)
  }

  // Resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    setAuthError('')
    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend_code', email: verificationEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResendCooldown(60)
    } catch (err: any) {
      setAuthError(err.message)
    }
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

  // Photo timetable upload for a specific boy
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedBoyForUpload) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPhotoPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirmPhoto = async () => {
    if (!photoPreview || !selectedBoyForUpload || !teacher) return
    setUploadingPhoto(true)
    try {
      const boy = boys.find(b => b.id === selectedBoyForUpload)
      // Persist to API (Supabase Storage + DB)
      await fetch('/api/teacher/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boyId: selectedBoyForUpload,
          boyName: boy?.name || '',
          divMasterId: teacher.id,
          term,
          photoData: photoPreview,
        }),
      })

      setUploadedPhotos(prev => ({ ...prev, [selectedBoyForUpload]: photoPreview }))
      setMessage({ type: 'success', text: `Timetable photo saved for ${boy?.name || 'boy'}` })

      // Move to next boy without a photo
      const boysWithoutPhoto = boys.filter(b => !uploadedPhotos[b.id] && b.id !== selectedBoyForUpload)
      if (boysWithoutPhoto.length > 0) {
        setSelectedBoyForUpload(boysWithoutPhoto[0].id)
        setPhotoPreview(null)
      } else {
        setSelectedBoyForUpload(null)
        setPhotoPreview(null)
        setMessage({ type: 'success', text: 'All boys have timetable photos uploaded!' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setUploadingPhoto(false)
  }

  // Fetch previously uploaded photos on load
  const fetchUploadedPhotos = useCallback(async () => {
    if (!teacher || teacher.id === 'coach-account') return
    try {
      const res = await fetch(`/api/teacher/photos?divMasterId=${teacher.id}&term=${encodeURIComponent(term)}`)
      const data = await res.json()
      if (data.photos?.length > 0) {
        const photoMap: Record<string, string> = {}
        data.photos.forEach((p: any) => { photoMap[p.boy_id] = p.public_url || 'uploaded' })
        setUploadedPhotos(photoMap)
      }
    } catch {}
  }, [teacher, term])

  useEffect(() => {
    if (teacher) fetchUploadedPhotos()
  }, [teacher, term, fetchUploadedPhotos])

  // Count boys with uploaded photos
  const boysWithPhotos = boys.filter(b => uploadedPhotos[b.id]).length
  const totalBoysForUpload = boys.length

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
            {verificationStep ? (
              <>
                {/* Email Verification Step */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                    <Mail size={28} style={{ color: '#65B863' }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: '#1E2333' }}>Check your email</h3>
                  <p className="text-sm mt-2" style={{ color: '#676D82' }}>
                    We sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#F87D4D' }}>{verificationEmail}</p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Verification Code</label>
                    <input
                      type="text" required value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863] text-center text-2xl tracking-[0.5em] font-bold"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                    />
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                      <AlertCircle size={16} />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit" disabled={authLoading || verificationCode.length < 6}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: '#65B863' }}
                  >
                    {authLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => { setVerificationStep(false); setAuthError(''); setVerificationCode('') }}
                    className="text-xs font-medium hover:underline" style={{ color: '#676D82' }}
                  >
                    ← Back to login
                  </button>
                  <button
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                    className="text-xs font-medium hover:underline disabled:opacity-50" style={{ color: '#F87D4D' }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </>
            ) : (
              <>
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
                          onChange={e => setAuthForm({ ...authForm, pin: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863] text-center text-lg tracking-wider"
                          style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                          placeholder="Enter access PIN"
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
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(248,125,77,0.06)' }}>
                        <Mail size={14} style={{ color: '#F87D4D' }} />
                        <span className="text-[11px]" style={{ color: '#676D82' }}>A verification code will be sent to your email</span>
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
              </>
            )}
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
              { key: 'upload' as const, label: 'Upload Photos', icon: Camera },
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
                <h2 className="text-xl font-bold font-heading" style={{ color: '#1E2333' }}>My Division Boys</h2>
                <p className="text-sm" style={{ color: '#676D82' }}>Boys assigned to your division from booking data. View their details and blocked school slots.</p>
              </div>
              <div className="flex gap-2">
                {boys.length > 0 && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ backgroundColor: '#F87D4D', color: '#FFF' }}
                  >
                    <Camera size={16} />
                    Upload Timetables
                  </button>
                )}
              </div>
            </div>

            {/* Boys List with Blocked Slots Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw size={24} className="animate-spin" style={{ color: '#F87D4D' }} />
              </div>
            ) : boys.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: '#FFF', border: '2px dashed #EAEDE6' }}>
                <Users size={48} className="mx-auto mb-4" style={{ color: '#EAEDE6' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>No boys assigned to your division yet</h3>
                <p className="text-sm" style={{ color: '#676D82' }}>The admin will add boys from Ludgrove booking data. Check back soon.</p>
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
                            className="p-2 rounded-lg transition-all hover:bg-gray-100" title="View blocked slots">
                            {isEditing ? <EyeOff size={16} style={{ color: '#676D82' }} /> : <Eye size={16} style={{ color: '#676D82' }} />}
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

        {/* ─── UPLOAD TAB — Photo Timetable Upload (Sequential) ─── */}
        {activeTab === 'upload' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-heading" style={{ color: '#1E2333' }}>Upload School Timetables</h2>
                <p className="text-sm" style={{ color: '#676D82' }}>
                  Take a photo of each boy&apos;s school timetable. Select a boy, upload the photo, then move to the next.
                </p>
              </div>
              {totalBoysForUpload > 0 && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: '#676D82' }}>{boysWithPhotos} / {totalBoysForUpload} uploaded</p>
                    <div className="w-32 h-2 rounded-full mt-1" style={{ backgroundColor: '#EAEDE6' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${totalBoysForUpload > 0 ? (boysWithPhotos / totalBoysForUpload) * 100 : 0}%`, backgroundColor: boysWithPhotos === totalBoysForUpload ? '#65B863' : '#F87D4D' }}></div>
                    </div>
                  </div>
                  <button
                    onClick={handleMarkComplete}
                    disabled={boysWithPhotos === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{ backgroundColor: isUploadComplete ? '#676D82' : '#65B863', color: '#FFF' }}
                  >
                    {isUploadComplete ? <CheckCircle size={16} /> : <Upload size={16} />}
                    {isUploadComplete ? 'Complete ✓' : 'Mark Complete'}
                  </button>
                </div>
              )}
            </div>

            {boys.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: '#FFF', border: '2px dashed #EAEDE6' }}>
                <Users size={48} className="mx-auto mb-4" style={{ color: '#EAEDE6' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>No boys in your division yet</h3>
                <p className="text-sm" style={{ color: '#676D82' }}>The admin will add boys from booking data. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Boy List */}
                <div className="lg:col-span-1">
                  <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                    <div className="px-5 py-4 border-b" style={{ borderColor: '#EAEDE6', backgroundColor: '#F7F9FA' }}>
                      <h3 className="font-bold text-sm" style={{ color: '#1E2333' }}>Select Boy</h3>
                      <p className="text-[10px] mt-0.5" style={{ color: '#676D82' }}>Choose a boy to upload their school timetable photo</p>
                    </div>
                    <div className="divide-y" style={{ borderColor: '#EAEDE6' }}>
                      {boys.map((boy, idx) => {
                        const hasPhoto = !!uploadedPhotos[boy.id]
                        const isSelected = selectedBoyForUpload === boy.id
                        return (
                          <button
                            key={boy.id}
                            onClick={() => { setSelectedBoyForUpload(boy.id); setPhotoPreview(uploadedPhotos[boy.id] || null) }}
                            className="w-full px-5 py-3.5 flex items-center gap-3 text-left transition-all hover:bg-gray-50"
                            style={{ backgroundColor: isSelected ? 'rgba(248,125,77,0.06)' : undefined, borderLeft: isSelected ? '3px solid #F87D4D' : '3px solid transparent' }}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: hasPhoto ? 'rgba(101,184,99,0.15)' : 'rgba(248,125,77,0.15)', color: hasPhoto ? '#65B863' : '#F87D4D' }}>
                              {hasPhoto ? <CheckCircle size={14} /> : <span>{idx + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: '#1E2333' }}>{boy.name}</p>
                              <p className="text-[10px]" style={{ color: '#676D82' }}>
                                {boy.year_group && `${boy.year_group}`}{boy.division && ` • ${boy.division}`}
                              </p>
                            </div>
                            {hasPhoto ? (
                              <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>Done</span>
                            ) : (
                              <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>Pending</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Photo Upload Area */}
                <div className="lg:col-span-2">
                  {!selectedBoyForUpload ? (
                    <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: '#FFF', border: '2px dashed #EAEDE6' }}>
                      <Camera size={48} className="mx-auto mb-4" style={{ color: '#EAEDE6' }} />
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>Select a boy from the list</h3>
                      <p className="text-sm" style={{ color: '#676D82' }}>Choose a boy to upload their school timetable photo</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                      {/* Current boy header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: 'rgba(248,125,77,0.15)', color: '#F87D4D' }}>
                            {boys.find(b => b.id === selectedBoyForUpload)?.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-base" style={{ color: '#1E2333' }}>
                              {boys.find(b => b.id === selectedBoyForUpload)?.name}
                            </h3>
                            <p className="text-xs" style={{ color: '#676D82' }}>Upload a photo of their school timetable</p>
                          </div>
                        </div>
                        {uploadedPhotos[selectedBoyForUpload] && (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                            <CheckCircle size={12} /> Photo uploaded
                          </span>
                        )}
                      </div>

                      {/* Photo upload zone */}
                      {!photoPreview ? (
                        <label className="flex flex-col items-center justify-center gap-4 p-12 rounded-xl cursor-pointer transition-all hover:border-[#F87D4D] hover:bg-orange-50/30"
                          style={{ border: '2px dashed #EAEDE6', backgroundColor: '#F7F9FA' }}>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(248,125,77,0.1)' }}>
                            <Camera size={32} style={{ color: '#F87D4D' }} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold" style={{ color: '#1E2333' }}>Take or upload a photo</p>
                            <p className="text-xs mt-1" style={{ color: '#676D82' }}>Tap to open camera or select from gallery</p>
                            <p className="text-[10px] mt-2" style={{ color: '#AFB0B3' }}>Supports JPG, PNG, HEIC</p>
                          </div>
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      ) : (
                        <div>
                          {/* Photo preview */}
                          <div className="relative rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #EAEDE6' }}>
                            <img src={photoPreview} alt="Timetable preview" className="w-full max-h-[400px] object-contain" style={{ backgroundColor: '#F7F9FA' }} />
                            <button
                              onClick={() => setPhotoPreview(null)}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all"
                            >
                              <X size={16} style={{ color: '#EF4444' }} />
                            </button>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-3">
                            <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-[1.01]"
                              style={{ backgroundColor: '#F7F9FA', color: '#676D82', border: '1px solid #EAEDE6' }}>
                              <Camera size={16} />
                              Retake Photo
                              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                            <button
                              onClick={handleConfirmPhoto}
                              disabled={uploadingPhoto}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-50"
                              style={{ backgroundColor: '#65B863' }}
                            >
                              {uploadingPhoto ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                              {uploadingPhoto ? 'Saving...' : 'Confirm & Next Boy'}
                              {!uploadingPhoto && <ArrowRight size={16} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tennis slot reference */}
                      <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#F7F9FA', border: '1px solid #EAEDE6' }}>
                        <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#676D82' }}>
                          <Clock size={12} /> Tennis Slot Times (for reference)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {SLOTS.map(slot => (
                            <span key={slot} className="text-[10px] px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: '#FFF', color: '#1E2333', border: '1px solid #EAEDE6' }}>
                              {SLOT_LABELS[slot]}: {SLOT_TIMES[slot]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
