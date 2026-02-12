'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Calendar, FileText, Receipt, Mail, AlertCircle, CheckCircle, Clock,
  Upload, X, ChevronRight, LogOut, User, Star, Eye, Download,
  Send, MessageSquare, Loader2
} from 'lucide-react'

type Coach = {
  id: string
  name: string
  email: string
  title?: string
}

type Invoice = {
  id: string
  invoice_month: string
  invoice_year: number
  file_name: string
  status: 'submitted' | 'approved' | 'corrections_needed' | 'paid'
  submitted_at: string
  reviewed_at?: string
  paid_at?: string
  admin_comment?: string
  amount?: number
}

type CoachingDocument = {
  id: string
  title: string
  description?: string
  file_name: string
  category: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CoachPortalPage() {
  // Auth state
  const [coach, setCoach] = useState<Coach | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', pin: '', phone: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Dashboard state
  const [activeSection, setActiveSection] = useState<'timetable' | 'rules' | 'invoices'>('timetable')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [documents, setDocuments] = useState<CoachingDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Invoice upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear(),
    file: null as File | null,
  })
  const [uploading, setUploading] = useState(false)

  // Persist auth
  useEffect(() => {
    const saved = localStorage.getItem('coach-auth')
    if (saved) {
      try {
        setCoach(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (coach) {
      localStorage.setItem('coach-auth', JSON.stringify(coach))
    } else {
      localStorage.removeItem('coach-auth')
    }
  }, [coach])

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!coach) return
    setLoading(true)
    try {
      const res = await fetch(`/api/coach/invoices?coachId=${coach.id}`)
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }, [coach])

  useEffect(() => {
    if (coach && activeSection === 'invoices') {
      fetchInvoices()
    }
  }, [coach, activeSection, fetchInvoices])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  // Clear message after 5s
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [message])

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const res = await fetch('/api/coach/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          email: authForm.email,
          pin: authForm.pin,
          name: authForm.name,
          phone: authForm.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.requiresVerification) {
        setVerificationStep(true)
        setVerificationEmail(authForm.email)
        setVerificationCode('')
        setResendCooldown(60)
      } else if (data.coach) {
        setCoach(data.coach)
        setAuthForm({ name: '', email: '', pin: '', phone: '' })
      }
    } catch (err: any) {
      setAuthError(err.message)
    }
    setAuthLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/coach/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', email: verificationEmail, code: verificationCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoach(data.coach)
      setAuthForm({ name: '', email: '', pin: '', phone: '' })
      setVerificationStep(false)
      setVerificationCode('')
    } catch (err: any) {
      setAuthError(err.message)
    }
    setAuthLoading(false)
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    try {
      const res = await fetch('/api/coach/auth', {
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
    setCoach(null)
    setActiveSection('timetable')
  }

  // Invoice upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Accept Word docs and PDFs
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
      ]
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please upload a Word document (.doc, .docx) or PDF' })
        return
      }
      setUploadForm({ ...uploadForm, file })
    }
  }

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coach || !uploadForm.file) return

    setUploading(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const fileData = reader.result as string

        const res = await fetch('/api/coach/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId: coach.id,
            coachName: coach.name,
            coachEmail: coach.email,
            invoiceMonth: `${uploadForm.month} ${uploadForm.year}`,
            invoiceYear: uploadForm.year,
            fileName: uploadForm.file!.name,
            fileData,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setMessage({ type: 'success', text: 'Invoice submitted successfully!' })
        setShowUploadModal(false)
        setUploadForm({ month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(), file: null })
        fetchInvoices()
        setUploading(false)
      }
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to read file' })
        setUploading(false)
      }
      reader.readAsDataURL(uploadForm.file)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Submitted' },
      approved: { bg: 'rgba(101, 184, 99, 0.1)', text: '#65B863', label: 'Approved' },
      paid: { bg: 'rgba(101, 184, 99, 0.1)', text: '#65B863', label: 'Paid' },
      corrections_needed: { bg: 'rgba(248, 125, 77, 0.1)', text: '#F87D4D', label: 'Corrections Needed' },
    }
    const style = styles[status] || styles.submitted
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    )
  }

  // ─── LOGIN SCREEN ───
  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E2333 0%, #2a3050 50%, #1E2333 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 w-full max-w-md mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{
              backgroundColor: 'rgba(101,184,99,0.15)',
              border: '1px solid rgba(101,184,99,0.2)',
            }}>
              <Star size={28} style={{ color: '#65B863' }} />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Coach Portal</h1>
            <p className="text-sm mt-2" style={{ color: '#AFB0B3' }}>
              Access your timetable, coaching rules, and invoices
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
            {verificationStep ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                    <Mail size={28} style={{ color: '#65B863' }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: '#1E2333' }}>Check your email</h3>
                  <p className="text-sm mt-2" style={{ color: '#676D82' }}>
                    We sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#65B863' }}>{verificationEmail}</p>
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
                    className="text-xs font-medium hover:underline disabled:opacity-50" style={{ color: '#65B863' }}
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
                      backgroundColor: authMode === 'login' ? '#65B863' : 'transparent',
                      color: authMode === 'login' ? '#FFF' : '#676D82',
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError('') }}
                    className="flex-1 py-3 text-xs font-bold transition-all"
                    style={{
                      backgroundColor: authMode === 'register' ? '#65B863' : 'transparent',
                      color: authMode === 'register' ? '#FFF' : '#676D82',
                    }}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Full Name</label>
                        <input
                          type="text" required value={authForm.name}
                          onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863]"
                          style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Phone (optional)</label>
                        <input
                          type="tel" value={authForm.phone}
                          onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863]"
                          style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                          placeholder="07123 456789"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Email Address</label>
                    <input
                      type="email" required value={authForm.email}
                      onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863]"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                      placeholder="coach@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>PIN (4-6 digits)</label>
                    <input
                      type="password" required value={authForm.pin}
                      onChange={e => setAuthForm({ ...authForm, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#65B863]"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                      placeholder="••••"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(101,184,99,0.06)' }}>
                    <Mail size={14} style={{ color: '#65B863' }} />
                    <span className="text-[11px]" style={{ color: '#676D82' }}>A verification code will be sent to your email</span>
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                      <AlertCircle size={16} />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit" disabled={authLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: '#65B863' }}
                  >
                    {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t" style={{ borderColor: '#EAEDE6' }}>
                  <div className="flex items-center justify-center gap-4">
                    <Link href="/teacher-admin" className="text-xs font-medium hover:underline" style={{ color: '#F87D4D' }}>
                      Div Master Portal
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

  // ─── DASHBOARD ───
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F9FA' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: 'rgba(101, 184, 99, 0.97)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Star size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Coach Portal</h1>
                <p className="text-xs text-white/70">{coach.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="bg-white border-b" style={{ borderColor: '#EAEDE6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { id: 'timetable', label: 'My Timetable', icon: Calendar },
              { id: 'rules', label: 'Coaching Rules', icon: FileText },
              { id: 'invoices', label: 'My Invoices & Payments', icon: Receipt },
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeSection === section.id ? '#65B863' : 'transparent',
                  color: activeSection === section.id ? 'white' : '#676D82',
                }}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
            style={{
              backgroundColor: message.type === 'success' ? '#65B863' : '#DC2626',
              color: 'white',
            }}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Timetable Section */}
        {activeSection === 'timetable' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>My Timetable</h2>
              <p className="text-sm mt-1" style={{ color: '#676D82' }}>View your coaching schedule</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #EAEDE6' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                <Calendar size={32} style={{ color: '#65B863' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>View Published Schedule</h3>
              <p className="text-sm mb-6" style={{ color: '#676D82' }}>
                Access the published tennis timetable for Ludgrove School
              </p>
              <Link
                href="/teacher-admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#65B863' }}
              >
                Open Timetable <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* Coaching Rules Section */}
        {activeSection === 'rules' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>Coaching Rules & Documents</h2>
              <p className="text-sm mt-1" style={{ color: '#676D82' }}>Important guidelines and policies</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #EAEDE6' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(248,125,77,0.1)' }}>
                <FileText size={32} style={{ color: '#F87D4D' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>Documents Coming Soon</h3>
              <p className="text-sm" style={{ color: '#676D82' }}>
                Coaching rules and policy documents will be added here shortly.
              </p>
            </div>
          </div>
        )}

        {/* Invoices Section */}
        {activeSection === 'invoices' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1E2333' }}>My Invoices & Payments</h2>
                <p className="text-sm mt-1" style={{ color: '#676D82' }}>Submit and track your invoices</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#65B863' }}
              >
                <Upload size={18} />
                Submit Invoice
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin" style={{ color: '#65B863' }} />
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #EAEDE6' }}>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                  <Receipt size={32} style={{ color: '#65B863' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>No Invoices Yet</h3>
                <p className="text-sm mb-6" style={{ color: '#676D82' }}>
                  Submit your first invoice using the button above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-2xl p-6"
                    style={{ border: '1px solid #EAEDE6' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                          <FileText size={24} style={{ color: '#65B863' }} />
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: '#1E2333' }}>{invoice.invoice_month}</h3>
                          <p className="text-sm" style={{ color: '#676D82' }}>{invoice.file_name}</p>
                          <p className="text-xs mt-1" style={{ color: '#AFB0B3' }}>
                            Submitted: {new Date(invoice.submitted_at).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(invoice.status)}
                        {invoice.amount && (
                          <p className="text-lg font-bold mt-2" style={{ color: '#1E2333' }}>
                            £{invoice.amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {invoice.admin_comment && (
                      <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                        <div className="flex items-start gap-2">
                          <MessageSquare size={16} style={{ color: '#D97706' }} />
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#92400E' }}>Admin Comment:</p>
                            <p className="text-sm" style={{ color: '#78350F' }}>{invoice.admin_comment}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upload Invoice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div
            className="relative bg-white rounded-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <X size={20} style={{ color: '#676D82' }} />
            </button>

            <h3 className="text-xl font-bold mb-6" style={{ color: '#1E2333' }}>Submit Invoice</h3>

            <form onSubmit={handleUploadInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Month</label>
                  <select
                    value={uploadForm.month}
                    onChange={e => setUploadForm({ ...uploadForm, month: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Year</label>
                  <select
                    value={uploadForm.year}
                    onChange={e => setUploadForm({ ...uploadForm, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Invoice File</label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-[#65B863] transition-colors"
                  style={{ borderColor: uploadForm.file ? '#65B863' : '#EAEDE6' }}
                  onClick={() => document.getElementById('invoice-file')?.click()}
                >
                  <input
                    id="invoice-file"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadForm.file ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle size={20} style={{ color: '#65B863' }} />
                      <span className="text-sm font-medium" style={{ color: '#1E2333' }}>{uploadForm.file.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: '#AFB0B3' }} className="mx-auto mb-2" />
                      <p className="text-sm" style={{ color: '#676D82' }}>Click to upload Word doc or PDF</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(101,184,99,0.06)' }}>
                <Send size={14} style={{ color: '#65B863' }} />
                <span className="text-[11px]" style={{ color: '#676D82' }}>Invoice will be sent to acestarsbookings@gmail.com</span>
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadForm.file}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ backgroundColor: '#65B863' }}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Invoice'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
