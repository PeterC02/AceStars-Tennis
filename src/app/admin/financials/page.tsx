'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Shield, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  ChevronRight, ChevronDown, Plus, X, Edit3, Download, RefreshCw,
  Users, AlertCircle, CheckCircle, Upload,
  Wallet, Receipt, Banknote, FileText
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Venue = {
  id: string
  name: string
  type: 'school' | 'club' | 'community'
  colour: string
}

type Programme = {
  id: string
  venueId: string
  name: string
  category: string
  pricePerStudent: number
  studentsEnrolled: number
  weeksPerTerm: number
  termsPerYear: number
  sessionsPerWeek: number
  notes: string
}

type ExpenseCategory = {
  id: string
  name: string
  type: 'fixed' | 'variable' | 'one-off'
  monthlyAmount: number
  notes: string
}

type DirectorPay = {
  name: string
  monthlyWage: number
  role: string
}

type DividendConfig = {
  peterShare: number   // percentage (e.g. 25)
  wojtekShare: number  // percentage (e.g. 75)
  retainedEarningsPercent: number // % of surplus to retain before dividends
}

type MonthlyForecast = {
  month: string
  revenue: number
  expenses: number
  directorWages: number
  netProfit: number
  cumulativeCash: number
  dividendsPeter: number
  dividendsWojtek: number
}

// ─── Default Data (Foundation — user will replace with real spreadsheet data) ─

const DEFAULT_VENUES: Venue[] = [
  { id: 'ludgrove', name: 'Ludgrove School', type: 'school', colour: '#F87D4D' },
  { id: 'edgbarrow', name: 'Edgbarrow School', type: 'school', colour: '#65B863' },
  { id: 'yateley', name: 'Yateley Manor', type: 'school', colour: '#3B82F6' },
  { id: 'nine-mile', name: 'Nine Mile Ride', type: 'school', colour: '#8B5CF6' },
  { id: 'luckley', name: 'Luckley House School', type: 'school', colour: '#EC4899' },
  { id: 'cofe', name: 'C of E Primary', type: 'school', colour: '#14B8A6' },
  { id: 'oaklands', name: 'Oaklands Junior', type: 'school', colour: '#F59E0B' },
  { id: 'our-ladys', name: "Our Lady's Preparatory", type: 'school', colour: '#6366F1' },
  { id: 'iver-heath', name: 'Iver Heath Tennis Club', type: 'club', colour: '#dfd300' },
  { id: 'acestars-community', name: 'AceStars Community', type: 'community', colour: '#EF4444' },
  { id: 'bucklers', name: "Buckler's Park Courts", type: 'community', colour: '#0EA5E9' },
  { id: 'sandhurst', name: 'Sandhurst Memorial Park', type: 'community', colour: '#84CC16' },
]

const DEFAULT_PROGRAMMES: Programme[] = [
  // Ludgrove
  { id: 'lud-121', venueId: 'ludgrove', name: 'Standard 1-2-1', category: 'Private Coaching', pricePerStudent: 36, studentsEnrolled: 0, weeksPerTerm: 9, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  { id: 'lud-premium', venueId: 'ludgrove', name: 'Premium 1-2-1', category: 'Private Coaching', pricePerStudent: 45, studentsEnrolled: 0, weeksPerTerm: 9, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  { id: 'lud-group', venueId: 'ludgrove', name: 'Group Session (3 boys)', category: 'Group Coaching', pricePerStudent: 20, studentsEnrolled: 0, weeksPerTerm: 9, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  { id: 'lud-sunday', venueId: 'ludgrove', name: 'Sunday Clinic', category: 'Sunday Clinic', pricePerStudent: 15, studentsEnrolled: 0, weeksPerTerm: 9, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  // Edgbarrow
  { id: 'edg-perf', venueId: 'edgbarrow', name: 'Performance Programme', category: 'Performance', pricePerStudent: 18, studentsEnrolled: 0, weeksPerTerm: 12, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  { id: 'edg-dev', venueId: 'edgbarrow', name: 'Development Programme', category: 'Development', pricePerStudent: 12, studentsEnrolled: 0, weeksPerTerm: 12, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  { id: 'edg-after', venueId: 'edgbarrow', name: 'AfterSchool Club', category: 'AfterSchool', pricePerStudent: 6.50, studentsEnrolled: 0, weeksPerTerm: 12, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  // AceStars Community
  { id: 'ace-term', venueId: 'acestars-community', name: 'Term Time Programme', category: 'Term Time', pricePerStudent: 8.99, studentsEnrolled: 0, weeksPerTerm: 12, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
  { id: 'ace-camp', venueId: 'acestars-community', name: 'Holiday Camp', category: 'Holiday Camp', pricePerStudent: 30, studentsEnrolled: 0, weeksPerTerm: 4, termsPerYear: 3, sessionsPerWeek: 5, notes: '' },
  { id: 'ace-private', venueId: 'acestars-community', name: 'Private 1-2-1', category: 'Private Coaching', pricePerStudent: 45, studentsEnrolled: 0, weeksPerTerm: 12, termsPerYear: 3, sessionsPerWeek: 1, notes: '' },
]

const DEFAULT_EXPENSES: ExpenseCategory[] = [
  { id: 'exp-coaches', name: 'Coach Wages', type: 'variable', monthlyAmount: 0, notes: 'All coaching staff wages' },
  { id: 'exp-insurance', name: 'Insurance', type: 'fixed', monthlyAmount: 0, notes: 'Public liability & professional indemnity' },
  { id: 'exp-equipment', name: 'Equipment & Balls', type: 'variable', monthlyAmount: 0, notes: 'Rackets, balls, nets, cones' },
  { id: 'exp-venue-hire', name: 'Venue Hire / Court Fees', type: 'fixed', monthlyAmount: 0, notes: 'Court rental costs' },
  { id: 'exp-transport', name: 'Transport / Fuel', type: 'variable', monthlyAmount: 0, notes: 'Travel between venues' },
  { id: 'exp-marketing', name: 'Marketing & Website', type: 'fixed', monthlyAmount: 0, notes: 'Website hosting, ads, flyers' },
  { id: 'exp-accounting', name: 'Accounting & Legal', type: 'fixed', monthlyAmount: 0, notes: 'Accountant fees, Companies House' },
  { id: 'exp-software', name: 'Software & Subscriptions', type: 'fixed', monthlyAmount: 0, notes: 'Booking system, email, etc.' },
  { id: 'exp-misc', name: 'Miscellaneous', type: 'variable', monthlyAmount: 0, notes: 'Other operating costs' },
]

const DEFAULT_DIRECTORS: DirectorPay[] = [
  { name: 'Peter', monthlyWage: 0, role: 'Operations Director' },
  { name: 'Wojtek', monthlyWage: 0, role: 'Head Coach' },
]

const DEFAULT_DIVIDEND_CONFIG: DividendConfig = {
  peterShare: 25,
  wojtekShare: 75,
  retainedEarningsPercent: 0,
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return amount < 0 ? `-£${formatted}` : `£${formatted}`
}

function formatCompact(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  if (abs >= 1000) {
    return `${sign}£${(abs / 1000).toFixed(1)}k`
  }
  return formatCurrency(amount)
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// ─── Local Storage Persistence ───────────────────────────────────────────────

const STORAGE_KEY = 'acestars-financials'

function loadState() {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveState(state: {
  venues: Venue[]
  programmes: Programme[]
  expenses: ExpenseCategory[]
  directors: DirectorPay[]
  dividendConfig: DividendConfig
  openingBalance: number
  financialYear: string
}) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FinancialsPage() {
  // Admin auth (same pattern as main admin page)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  // Validate persisted session token on load
  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('admin-auth-token')
    if (token) {
      fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', token }),
      })
        .then(res => res.json())
        .then(data => { if (data.valid && data.role === 'admin') setIsAdminLoggedIn(true) })
        .catch(() => localStorage.removeItem('admin-auth-token'))
    }
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', pin: adminPin, role: 'admin' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.role === 'admin') {
        setIsAdminLoggedIn(true)
        localStorage.setItem('admin-auth-token', data.token)
      } else {
        setAdminError('This PIN is not for admin access')
      }
    } catch (err: any) {
      setAdminError(err.message)
    }
    setAdminLoading(false)
  }

  const handleAdminLogout = () => {
    const token = localStorage.getItem('admin-auth-token')
    if (token) {
      fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout', token }),
      }).catch(() => {})
    }
    setIsAdminLoggedIn(false)
    localStorage.removeItem('admin-auth-token')
  }

  // ─── Financial State ─────────────────────────────────────────────────────

  const [venues, setVenues] = useState<Venue[]>(DEFAULT_VENUES)
  const [programmes, setProgrammes] = useState<Programme[]>(DEFAULT_PROGRAMMES)
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(DEFAULT_EXPENSES)
  const [directors, setDirectors] = useState<DirectorPay[]>(DEFAULT_DIRECTORS)
  const [dividendConfig, setDividendConfig] = useState<DividendConfig>(DEFAULT_DIVIDEND_CONFIG)
  const [openingBalance, setOpeningBalance] = useState(0)
  const [financialYear, setFinancialYear] = useState('2026')

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenue' | 'expenses' | 'payroll' | 'cashflow' | 'pnl'>('dashboard')
  const [expandedVenues, setExpandedVenues] = useState<string[]>([])
  const [editingProgramme, setEditingProgramme] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)

  // Load saved state
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      if (saved.venues) setVenues(saved.venues)
      if (saved.programmes) setProgrammes(saved.programmes)
      if (saved.expenses) setExpenses(saved.expenses)
      if (saved.directors) setDirectors(saved.directors)
      if (saved.dividendConfig) setDividendConfig(saved.dividendConfig)
      if (saved.openingBalance !== undefined) setOpeningBalance(saved.openingBalance)
      if (saved.financialYear) setFinancialYear(saved.financialYear)
    }
  }, [])

  // Auto-save on change
  useEffect(() => {
    saveState({ venues, programmes, expenses, directors, dividendConfig, openingBalance, financialYear })
  }, [venues, programmes, expenses, directors, dividendConfig, openingBalance, financialYear])

  // ─── Calculations ────────────────────────────────────────────────────────

  // Annual revenue per programme
  const programmeAnnualRevenue = useCallback((p: Programme) => {
    return p.pricePerStudent * p.studentsEnrolled * p.weeksPerTerm * p.termsPerYear * p.sessionsPerWeek
  }, [])

  // Total annual revenue
  const totalAnnualRevenue = useMemo(() => {
    return programmes.reduce((sum, p) => sum + programmeAnnualRevenue(p), 0)
  }, [programmes, programmeAnnualRevenue])

  // Revenue by venue
  const revenueByVenue = useMemo(() => {
    const map: Record<string, number> = {}
    venues.forEach(v => { map[v.id] = 0 })
    programmes.forEach(p => {
      map[p.venueId] = (map[p.venueId] || 0) + programmeAnnualRevenue(p)
    })
    return map
  }, [venues, programmes, programmeAnnualRevenue])

  // Total annual expenses
  const totalAnnualExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.monthlyAmount * 12, 0)
  }, [expenses])

  // Total annual director wages
  const totalAnnualDirectorWages = useMemo(() => {
    return directors.reduce((sum, d) => sum + d.monthlyWage * 12, 0)
  }, [directors])

  // Net profit (before dividends)
  const annualNetProfit = useMemo(() => {
    return totalAnnualRevenue - totalAnnualExpenses - totalAnnualDirectorWages
  }, [totalAnnualRevenue, totalAnnualExpenses, totalAnnualDirectorWages])

  // Dividends
  const annualDividends = useMemo(() => {
    const distributable = Math.max(0, annualNetProfit * (1 - dividendConfig.retainedEarningsPercent / 100))
    return {
      peter: distributable * (dividendConfig.peterShare / 100),
      wojtek: distributable * (dividendConfig.wojtekShare / 100),
      retained: annualNetProfit - distributable,
      total: distributable,
    }
  }, [annualNetProfit, dividendConfig])

  // Monthly cash flow forecast (12 months)
  const monthlyForecast = useMemo((): MonthlyForecast[] => {
    const monthlyRevenue = totalAnnualRevenue / 12
    const monthlyExpenses = totalAnnualExpenses / 12
    const monthlyDirectorWages = totalAnnualDirectorWages / 12
    const monthlyDividendPeter = annualDividends.peter / 12
    const monthlyDividendWojtek = annualDividends.wojtek / 12

    let cumulative = openingBalance
    return MONTHS.map((month) => {
      const netProfit = monthlyRevenue - monthlyExpenses - monthlyDirectorWages
      cumulative += netProfit - monthlyDividendPeter - monthlyDividendWojtek
      return {
        month,
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        directorWages: monthlyDirectorWages,
        netProfit,
        cumulativeCash: cumulative,
        dividendsPeter: monthlyDividendPeter,
        dividendsWojtek: monthlyDividendWojtek,
      }
    })
  }, [totalAnnualRevenue, totalAnnualExpenses, totalAnnualDirectorWages, annualDividends, openingBalance])

  // Gross margin
  const grossMargin = totalAnnualRevenue > 0 ? ((totalAnnualRevenue - totalAnnualExpenses) / totalAnnualRevenue * 100) : 0
  const netMargin = totalAnnualRevenue > 0 ? (annualNetProfit / totalAnnualRevenue * 100) : 0

  // ─── Programme CRUD ──────────────────────────────────────────────────────

  const updateProgramme = (id: string, field: keyof Programme, value: any) => {
    setProgrammes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const deleteProgramme = (id: string) => {
    setProgrammes(prev => prev.filter(p => p.id !== id))
  }

  const addProgramme = (venueId: string) => {
    const newId = `prog-${Date.now()}`
    setProgrammes(prev => [...prev, {
      id: newId, venueId, name: 'New Programme', category: 'General',
      pricePerStudent: 0, studentsEnrolled: 0, weeksPerTerm: 12,
      termsPerYear: 3, sessionsPerWeek: 1, notes: '',
    }])
    setEditingProgramme(newId)
  }

  // ─── Expense CRUD ────────────────────────────────────────────────────────

  const updateExpense = (id: string, field: keyof ExpenseCategory, value: any) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const addExpense = () => {
    const newId = `exp-${Date.now()}`
    setExpenses(prev => [...prev, {
      id: newId, name: 'New Expense', type: 'fixed', monthlyAmount: 0, notes: '',
    }])
    setEditingExpense(newId)
  }

  // ─── Export ──────────────────────────────────────────────────────────────

  const exportCSV = () => {
    let csv = 'AceStars Business Financials\n\n'
    csv += `Financial Year,${financialYear}\n`
    csv += `Opening Balance,${openingBalance}\n\n`

    csv += 'REVENUE\n'
    csv += 'Venue,Programme,Category,Price/Student,Students,Weeks/Term,Terms/Year,Sessions/Week,Annual Revenue\n'
    programmes.forEach(p => {
      const venue = venues.find(v => v.id === p.venueId)
      csv += `${venue?.name},${p.name},${p.category},${p.pricePerStudent},${p.studentsEnrolled},${p.weeksPerTerm},${p.termsPerYear},${p.sessionsPerWeek},${programmeAnnualRevenue(p)}\n`
    })
    csv += `\nTotal Annual Revenue,,,,,,,,${totalAnnualRevenue}\n\n`

    csv += 'OPERATING EXPENSES\n'
    csv += 'Category,Type,Monthly Amount,Annual Amount\n'
    expenses.forEach(e => {
      csv += `${e.name},${e.type},${e.monthlyAmount},${e.monthlyAmount * 12}\n`
    })
    csv += `\nTotal Annual Expenses,,,${totalAnnualExpenses}\n\n`

    csv += 'DIRECTOR WAGES\n'
    csv += 'Name,Role,Monthly Wage,Annual Wage\n'
    directors.forEach(d => {
      csv += `${d.name},${d.role},${d.monthlyWage},${d.monthlyWage * 12}\n`
    })
    csv += `\nTotal Annual Director Wages,,,${totalAnnualDirectorWages}\n\n`

    csv += 'PROFIT & LOSS\n'
    csv += `Total Revenue,,${totalAnnualRevenue}\n`
    csv += `Total Expenses,,${totalAnnualExpenses}\n`
    csv += `Director Wages,,${totalAnnualDirectorWages}\n`
    csv += `Net Profit,,${annualNetProfit}\n`
    csv += `Peter Dividends (${dividendConfig.peterShare}%),,${annualDividends.peter}\n`
    csv += `Wojtek Dividends (${dividendConfig.wojtekShare}%),,${annualDividends.wojtek}\n\n`

    csv += 'CASH FLOW FORECAST\n'
    csv += 'Month,Revenue,Expenses,Director Wages,Net Profit,Cumulative Cash,Peter Dividend,Wojtek Dividend\n'
    monthlyForecast.forEach(m => {
      csv += `${m.month},${m.revenue.toFixed(2)},${m.expenses.toFixed(2)},${m.directorWages.toFixed(2)},${m.netProfit.toFixed(2)},${m.cumulativeCash.toFixed(2)},${m.dividendsPeter.toFixed(2)},${m.dividendsWojtek.toFixed(2)}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acestars-financials-${financialYear}.csv`
    a.click()
  }

  // ─── Reset ───────────────────────────────────────────────────────────────

  const resetAll = () => {
    if (confirm('Reset all financial data to defaults? This cannot be undone.')) {
      setVenues(DEFAULT_VENUES)
      setProgrammes(DEFAULT_PROGRAMMES)
      setExpenses(DEFAULT_EXPENSES)
      setDirectors(DEFAULT_DIRECTORS)
      setDividendConfig(DEFAULT_DIVIDEND_CONFIG)
      setOpeningBalance(0)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // ─── CSV Import ─────────────────────────────────────────────────────────

  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string
        const lines = text.split(/\r?\n/).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')))
        let section = ''
        const importedProgrammes: Programme[] = []
        const importedExpenses: ExpenseCategory[] = []
        const importedDirectors: DirectorPay[] = []
        let importedOpening = openingBalance
        let importedYear = financialYear

        for (const cols of lines) {
          const first = cols[0]?.toLowerCase() || ''
          // Detect section headers
          if (first.includes('financial year')) { importedYear = cols[1] || financialYear; continue }
          if (first.includes('opening balance')) { importedOpening = parseFloat(cols[1]) || 0; continue }
          if (first === 'revenue') { section = 'revenue'; continue }
          if (first.includes('operating expenses') || first === 'expenses') { section = 'expenses'; continue }
          if (first.includes('director wages') || first.includes('director') && first.includes('wage')) { section = 'directors'; continue }
          if (first.includes('profit') || first.includes('cash flow') || first.includes('dividend')) { section = ''; continue }
          if (first.startsWith('total') || first === '' || first.startsWith('venue') || first.startsWith('category') || first.startsWith('name')) continue

          if (section === 'revenue' && cols.length >= 7) {
            const venueName = cols[0]
            const venue = venues.find(v => v.name.toLowerCase().includes(venueName.toLowerCase())) || venues[0]
            importedProgrammes.push({
              id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              venueId: venue.id,
              name: cols[1] || 'Imported Programme',
              category: cols[2] || 'General',
              pricePerStudent: parseFloat(cols[3]) || 0,
              studentsEnrolled: parseInt(cols[4]) || 0,
              weeksPerTerm: parseInt(cols[5]) || 12,
              termsPerYear: parseInt(cols[6]) || 3,
              sessionsPerWeek: parseInt(cols[7]) || 1,
              notes: '',
            })
          } else if (section === 'expenses' && cols.length >= 3) {
            importedExpenses.push({
              id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: cols[0],
              type: (cols[1]?.toLowerCase() as 'fixed' | 'variable' | 'one-off') || 'fixed',
              monthlyAmount: parseFloat(cols[2]) || 0,
              notes: cols[4] || '',
            })
          } else if (section === 'directors' && cols.length >= 3) {
            importedDirectors.push({
              name: cols[0],
              role: cols[1] || 'Director',
              monthlyWage: parseFloat(cols[2]) || 0,
            })
          }
        }

        if (importedProgrammes.length > 0) setProgrammes(importedProgrammes)
        if (importedExpenses.length > 0) setExpenses(importedExpenses)
        if (importedDirectors.length > 0) setDirectors(importedDirectors)
        setOpeningBalance(importedOpening)
        setFinancialYear(importedYear)

        const counts = [
          importedProgrammes.length > 0 ? `${importedProgrammes.length} programmes` : '',
          importedExpenses.length > 0 ? `${importedExpenses.length} expenses` : '',
          importedDirectors.length > 0 ? `${importedDirectors.length} directors` : '',
        ].filter(Boolean).join(', ')
        setImportStatus(counts ? `Imported: ${counts}` : 'No data rows found — check CSV format')
        setTimeout(() => setImportStatus(null), 5000)
      } catch {
        setImportStatus('Import failed — check file format')
        setTimeout(() => setImportStatus(null), 5000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ─── Render: Login Gate ──────────────────────────────────────────────────

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E2333 0%, #2a3050 50%, #1E2333 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="w-full max-w-sm mx-4 relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: 'rgba(223,211,0,0.15)', border: '1px solid rgba(223,211,0,0.2)' }}>
              <TrendingUp size={28} style={{ color: '#dfd300' }} />
            </div>
            <Link href="/">
              <p className="text-2xl font-bold text-white mb-1">AceStars <span style={{ color: '#dfd300' }}>Financials</span></p>
            </Link>
            <p className="text-sm mt-2" style={{ color: '#AFB0B3' }}>Business financial forecasting</p>
          </div>
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: '#FFF' }}>
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1E2333' }}>Admin PIN</label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  placeholder="Enter admin PIN"
                  className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all focus:border-[#dfd300]"
                  style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  autoFocus
                />
              </div>
              {adminError && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <AlertCircle size={16} /> {adminError}
                </div>
              )}
              <button
                type="submit"
                disabled={adminLoading || !adminPin}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
              >
                {adminLoading ? 'Verifying...' : 'Access Financials'}
              </button>
            </form>
            <div className="mt-4 flex gap-2">
              <Link href="/admin" className="flex-1 py-2.5 rounded-xl font-bold text-sm text-center transition-all hover:opacity-80" style={{ backgroundColor: '#F5F5F5', color: '#676D82' }}>
                Main Admin
              </Link>
              <Link href="/" className="flex-1 py-2.5 rounded-xl font-bold text-sm text-center transition-all hover:opacity-80" style={{ backgroundColor: '#F5F5F5', color: '#676D82' }}>
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Dashboard ───────────────────────────────────────────────────

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'revenue' as const, label: 'Revenue', icon: TrendingUp },
    { id: 'expenses' as const, label: 'Expenses', icon: Receipt },
    { id: 'payroll' as const, label: 'Payroll & Dividends', icon: Users },
    { id: 'cashflow' as const, label: 'Cash Flow', icon: Banknote },
    { id: 'pnl' as const, label: 'P&L Statement', icon: FileText },
  ]

  // Max bar height for cash flow chart
  const maxCashFlow = Math.max(...monthlyForecast.map(m => Math.abs(m.cumulativeCash)), 1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#1E2333', borderColor: '#2E354E' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-sm font-bold" style={{ color: '#AFB0B3' }}>
                <Shield size={16} /> Admin
              </Link>
              <ChevronRight size={14} style={{ color: '#676D82' }} />
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: '#dfd300' }} />
                <span className="text-white font-bold">Business Financials</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={financialYear}
                onChange={e => setFinancialYear(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold border-0 outline-none"
                style={{ backgroundColor: '#2E354E', color: '#dfd300' }}
              >
                {['2024', '2025', '2026', '2027', '2028'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-80 cursor-pointer" style={{ backgroundColor: '#3B82F6', color: '#FFF' }}>
                <Upload size={14} /> Import CSV
                <input type="file" accept=".csv,.txt" onChange={handleCSVImport} className="hidden" />
              </label>
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-80" style={{ backgroundColor: '#65B863', color: '#FFF' }}>
                <Download size={14} /> Export
              </button>
              <button onClick={resetAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-80" style={{ backgroundColor: '#2E354E', color: '#AFB0B3' }}>
                <RefreshCw size={14} /> Reset
              </button>
              <button onClick={handleAdminLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-80" style={{ backgroundColor: '#EF4444', color: '#FFF' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b" style={{ backgroundColor: '#FFF', borderColor: '#EAEDE6' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
                  activeTab === tab.id ? 'shadow-sm' : 'hover:opacity-80'
                )}
                style={{
                  backgroundColor: activeTab === tab.id ? '#1E2333' : 'transparent',
                  color: activeTab === tab.id ? '#dfd300' : '#676D82',
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Import Status Banner */}
      {importStatus && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-bold" style={{ backgroundColor: importStatus.startsWith('Imported') ? '#F0FDF4' : '#FEF2F2', color: importStatus.startsWith('Imported') ? '#166534' : '#DC2626' }}>
            {importStatus.startsWith('Imported') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {importStatus}
            <button onClick={() => setImportStatus(null)} className="ml-auto p-0.5 rounded hover:opacity-70"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">

        {/* ═══ DASHBOARD TAB ═══ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Annual Revenue" value={formatCurrency(totalAnnualRevenue)} icon={TrendingUp} colour="#65B863" />
              <KPICard label="Annual Expenses" value={formatCurrency(totalAnnualExpenses + totalAnnualDirectorWages)} icon={TrendingDown} colour="#EF4444" />
              <KPICard label="Net Profit" value={formatCurrency(annualNetProfit)} icon={DollarSign} colour={annualNetProfit >= 0 ? '#65B863' : '#EF4444'} />
              <KPICard label="Net Margin" value={`${netMargin.toFixed(1)}%`} icon={PieChart} colour={netMargin >= 0 ? '#3B82F6' : '#EF4444'} />
            </div>

            {/* Revenue by Venue */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Revenue by Venue</h3>
                <div className="space-y-3">
                  {venues.filter(v => revenueByVenue[v.id] > 0).sort((a, b) => revenueByVenue[b.id] - revenueByVenue[a.id]).map(venue => {
                    const rev = revenueByVenue[venue.id]
                    const pct = totalAnnualRevenue > 0 ? (rev / totalAnnualRevenue * 100) : 0
                    return (
                      <div key={venue.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-bold" style={{ color: '#1E2333' }}>{venue.name}</span>
                          <span className="font-bold" style={{ color: venue.colour }}>{formatCurrency(rev)}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F0F0' }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: venue.colour }} />
                        </div>
                      </div>
                    )
                  })}
                  {venues.every(v => revenueByVenue[v.id] === 0) && (
                    <p className="text-sm text-center py-8" style={{ color: '#AFB0B3' }}>Add student numbers in the Revenue tab to see venue breakdown</p>
                  )}
                </div>
              </div>

              {/* Director Pay & Dividends Summary */}
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Director Compensation</h3>
                <div className="space-y-4">
                  {directors.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#1E2333' }}>{d.name}</p>
                        <p className="text-xs" style={{ color: '#AFB0B3' }}>{d.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: '#1E2333' }}>{formatCurrency(d.monthlyWage)}/mo</p>
                        <p className="text-xs" style={{ color: '#65B863' }}>
                          + {formatCurrency(d.name === 'Peter' ? annualDividends.peter / 12 : annualDividends.wojtek / 12)}/mo div
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t" style={{ borderColor: '#EAEDE6' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#676D82' }}>Dividend Split</span>
                      <span className="font-bold" style={{ color: '#1E2333' }}>Peter {dividendConfig.peterShare}% / Wojtek {dividendConfig.wojtekShare}%</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span style={{ color: '#676D82' }}>Annual Surplus for Dividends</span>
                      <span className="font-bold" style={{ color: annualNetProfit >= 0 ? '#65B863' : '#EF4444' }}>{formatCurrency(annualDividends.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Cash Flow Chart */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#1E2333' }}>12-Month Cash Flow Forecast</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm" style={{ color: '#676D82' }}>Opening Balance:</label>
                  <div className="flex items-center">
                    <span className="text-sm font-bold mr-1" style={{ color: '#1E2333' }}>£</span>
                    <input
                      type="number"
                      value={openingBalance}
                      onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 rounded-lg text-sm font-bold border outline-none focus:border-[#dfd300]"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-48">
                {monthlyForecast.map((m, i) => {
                  const height = maxCashFlow > 0 ? Math.abs(m.cumulativeCash) / maxCashFlow * 100 : 0
                  const isNegative = m.cumulativeCash < 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold" style={{ color: isNegative ? '#EF4444' : '#65B863' }}>
                        {formatCompact(m.cumulativeCash)}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-md transition-all duration-500"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                            backgroundColor: isNegative ? '#FCA5A5' : '#86EFAC',
                            border: `1px solid ${isNegative ? '#EF4444' : '#65B863'}`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: '#AFB0B3' }}>{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REVENUE TAB ═══ */}
        {activeTab === 'revenue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#1E2333' }}>Revenue by Venue & Programme</h2>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#E8F5E9' }}>
                <TrendingUp size={16} style={{ color: '#65B863' }} />
                <span className="font-bold text-sm" style={{ color: '#2E7D32' }}>Total: {formatCurrency(totalAnnualRevenue)}/yr</span>
              </div>
            </div>

            {venues.map(venue => {
              const venueProgrammes = programmes.filter(p => p.venueId === venue.id)
              const venueRevenue = venueProgrammes.reduce((sum, p) => sum + programmeAnnualRevenue(p), 0)
              const isExpanded = expandedVenues.includes(venue.id)

              return (
                <div key={venue.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
                  <button
                    onClick={() => setExpandedVenues(prev => isExpanded ? prev.filter(v => v !== venue.id) : [...prev, venue.id])}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: venue.colour }} />
                      <span className="font-bold" style={{ color: '#1E2333' }}>{venue.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#F0F0F0', color: '#676D82' }}>
                        {venueProgrammes.length} programme{venueProgrammes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm" style={{ color: venue.colour }}>{formatCurrency(venueRevenue)}/yr</span>
                      {isExpanded ? <ChevronDown size={16} style={{ color: '#AFB0B3' }} /> : <ChevronRight size={16} style={{ color: '#AFB0B3' }} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t px-4 pb-4" style={{ borderColor: '#EAEDE6' }}>
                      <table className="w-full mt-3">
                        <thead>
                          <tr className="text-xs font-bold" style={{ color: '#AFB0B3' }}>
                            <th className="text-left pb-2 pl-2">Programme</th>
                            <th className="text-right pb-2">£/Student</th>
                            <th className="text-right pb-2">Students</th>
                            <th className="text-right pb-2">Wks/Term</th>
                            <th className="text-right pb-2">Terms/Yr</th>
                            <th className="text-right pb-2">Sess/Wk</th>
                            <th className="text-right pb-2 pr-2">Annual Rev</th>
                            <th className="text-right pb-2 w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {venueProgrammes.map(p => (
                            <tr key={p.id} className="border-t text-sm" style={{ borderColor: '#F5F5F5' }}>
                              <td className="py-2 pl-2">
                                {editingProgramme === p.id ? (
                                  <input value={p.name} onChange={e => updateProgramme(p.id, 'name', e.target.value)} className="w-full px-2 py-1 rounded border text-sm outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6' }} />
                                ) : (
                                  <span className="font-bold" style={{ color: '#1E2333' }}>{p.name}</span>
                                )}
                              </td>
                              <td className="py-2 text-right">
                                <input type="number" step="0.01" value={p.pricePerStudent} onChange={e => updateProgramme(p.id, 'pricePerStudent', parseFloat(e.target.value) || 0)} className="w-16 px-1 py-1 rounded border text-sm text-right outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#1E2333' }} />
                              </td>
                              <td className="py-2 text-right">
                                <input type="number" value={p.studentsEnrolled} onChange={e => updateProgramme(p.id, 'studentsEnrolled', parseInt(e.target.value) || 0)} className="w-14 px-1 py-1 rounded border text-sm text-right outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#1E2333' }} />
                              </td>
                              <td className="py-2 text-right">
                                <input type="number" value={p.weeksPerTerm} onChange={e => updateProgramme(p.id, 'weeksPerTerm', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 rounded border text-sm text-right outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#1E2333' }} />
                              </td>
                              <td className="py-2 text-right">
                                <input type="number" value={p.termsPerYear} onChange={e => updateProgramme(p.id, 'termsPerYear', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 rounded border text-sm text-right outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#1E2333' }} />
                              </td>
                              <td className="py-2 text-right">
                                <input type="number" value={p.sessionsPerWeek} onChange={e => updateProgramme(p.id, 'sessionsPerWeek', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 rounded border text-sm text-right outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#1E2333' }} />
                              </td>
                              <td className="py-2 text-right pr-2 font-bold" style={{ color: venue.colour }}>
                                {formatCurrency(programmeAnnualRevenue(p))}
                              </td>
                              <td className="py-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => setEditingProgramme(editingProgramme === p.id ? null : p.id)} className="p-1 rounded hover:bg-gray-100">
                                    <Edit3 size={12} style={{ color: '#AFB0B3' }} />
                                  </button>
                                  <button onClick={() => deleteProgramme(p.id)} className="p-1 rounded hover:bg-red-50">
                                    <X size={12} style={{ color: '#EF4444' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        onClick={() => addProgramme(venue.id)}
                        className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                        style={{ backgroundColor: '#F5F5F5', color: '#676D82' }}
                      >
                        <Plus size={12} /> Add Programme
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ═══ EXPENSES TAB ═══ */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#1E2333' }}>Operating Expenses</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                  <TrendingDown size={16} style={{ color: '#EF4444' }} />
                  <span className="font-bold text-sm" style={{ color: '#DC2626' }}>Total: {formatCurrency(totalAnnualExpenses)}/yr</span>
                </div>
                <button onClick={addExpense} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80" style={{ backgroundColor: '#1E2333', color: '#dfd300' }}>
                  <Plus size={14} /> Add Expense
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-bold border-b" style={{ color: '#AFB0B3', borderColor: '#EAEDE6' }}>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-right p-4">Monthly</th>
                    <th className="text-right p-4">Annual</th>
                    <th className="text-left p-4">Notes</th>
                    <th className="text-right p-4 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id} className="border-t text-sm" style={{ borderColor: '#F5F5F5' }}>
                      <td className="p-4">
                        {editingExpense === exp.id ? (
                          <input value={exp.name} onChange={e => updateExpense(exp.id, 'name', e.target.value)} className="w-full px-2 py-1 rounded border text-sm outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6' }} />
                        ) : (
                          <span className="font-bold" style={{ color: '#1E2333' }}>{exp.name}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select value={exp.type} onChange={e => updateExpense(exp.id, 'type', e.target.value)} className="px-2 py-1 rounded border text-xs font-bold outline-none" style={{ borderColor: '#EAEDE6', color: exp.type === 'fixed' ? '#3B82F6' : exp.type === 'variable' ? '#F59E0B' : '#8B5CF6' }}>
                          <option value="fixed">Fixed</option>
                          <option value="variable">Variable</option>
                          <option value="one-off">One-off</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm mr-1" style={{ color: '#AFB0B3' }}>£</span>
                          <input type="number" step="0.01" value={exp.monthlyAmount} onChange={e => updateExpense(exp.id, 'monthlyAmount', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 rounded border text-sm text-right outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#1E2333' }} />
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold" style={{ color: '#EF4444' }}>
                        {formatCurrency(exp.monthlyAmount * 12)}
                      </td>
                      <td className="p-4">
                        <input value={exp.notes} onChange={e => updateExpense(exp.id, 'notes', e.target.value)} placeholder="Notes..." className="w-full px-2 py-1 rounded border text-xs outline-none focus:border-[#dfd300]" style={{ borderColor: '#EAEDE6', color: '#676D82' }} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditingExpense(editingExpense === exp.id ? null : exp.id)} className="p-1 rounded hover:bg-gray-100">
                            <Edit3 size={12} style={{ color: '#AFB0B3' }} />
                          </button>
                          <button onClick={() => deleteExpense(exp.id)} className="p-1 rounded hover:bg-red-50">
                            <X size={12} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold text-sm" style={{ borderColor: '#EAEDE6' }}>
                    <td className="p-4" style={{ color: '#1E2333' }}>Total</td>
                    <td className="p-4"></td>
                    <td className="p-4 text-right" style={{ color: '#1E2333' }}>{formatCurrency(totalAnnualExpenses / 12)}</td>
                    <td className="p-4 text-right" style={{ color: '#EF4444' }}>{formatCurrency(totalAnnualExpenses)}</td>
                    <td className="p-4" colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PAYROLL & DIVIDENDS TAB ═══ */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#1E2333' }}>Payroll & Dividends</h2>

            {/* Director Wages */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Director Monthly Wages</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {directors.map((d, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: '#F8F9FA', border: '1px solid #EAEDE6' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold" style={{ color: '#1E2333' }}>{d.name}</p>
                        <p className="text-xs" style={{ color: '#AFB0B3' }}>{d.role}</p>
                      </div>
                      <Wallet size={20} style={{ color: '#dfd300' }} />
                    </div>
                    <label className="text-xs font-bold mb-1 block" style={{ color: '#676D82' }}>Monthly Wage (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={d.monthlyWage}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        setDirectors(prev => prev.map((dir, idx) => idx === i ? { ...dir, monthlyWage: val } : dir))
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm font-bold outline-none focus:border-[#dfd300]"
                      style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                    />
                    <div className="flex justify-between mt-2 text-xs" style={{ color: '#AFB0B3' }}>
                      <span>Annual: {formatCurrency(d.monthlyWage * 12)}</span>
                      <span>+ Dividends: {formatCurrency(d.name === 'Peter' ? annualDividends.peter : annualDividends.wojtek)}/yr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dividend Configuration */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Dividend Split Configuration</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: '#676D82' }}>Peter&apos;s Share (%)</label>
                  <input
                    type="number"
                    min={0} max={100}
                    value={dividendConfig.peterShare}
                    onChange={e => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      setDividendConfig(prev => ({ ...prev, peterShare: val, wojtekShare: 100 - val }))
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-sm font-bold outline-none focus:border-[#dfd300]"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: '#676D82' }}>Wojtek&apos;s Share (%)</label>
                  <input
                    type="number"
                    min={0} max={100}
                    value={dividendConfig.wojtekShare}
                    onChange={e => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      setDividendConfig(prev => ({ ...prev, wojtekShare: val, peterShare: 100 - val }))
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-sm font-bold outline-none focus:border-[#dfd300]"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: '#676D82' }}>Retained Earnings (%)</label>
                  <input
                    type="number"
                    min={0} max={100}
                    value={dividendConfig.retainedEarningsPercent}
                    onChange={e => setDividendConfig(prev => ({ ...prev, retainedEarningsPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm font-bold outline-none focus:border-[#dfd300]"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  />
                </div>
              </div>

              {/* Dividend Summary */}
              <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#AFB0B3' }}>Net Profit</p>
                    <p className="text-lg font-bold" style={{ color: annualNetProfit >= 0 ? '#65B863' : '#EF4444' }}>{formatCurrency(annualNetProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#AFB0B3' }}>Peter ({dividendConfig.peterShare}%)</p>
                    <p className="text-lg font-bold" style={{ color: '#F87D4D' }}>{formatCurrency(annualDividends.peter)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#AFB0B3' }}>Wojtek ({dividendConfig.wojtekShare}%)</p>
                    <p className="text-lg font-bold" style={{ color: '#65B863' }}>{formatCurrency(annualDividends.wojtek)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#AFB0B3' }}>Retained</p>
                    <p className="text-lg font-bold" style={{ color: '#3B82F6' }}>{formatCurrency(annualDividends.retained)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Compensation Table */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Total Annual Compensation</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-bold border-b" style={{ color: '#AFB0B3', borderColor: '#EAEDE6' }}>
                    <th className="text-left pb-3">Director</th>
                    <th className="text-right pb-3">Monthly Wage</th>
                    <th className="text-right pb-3">Annual Wage</th>
                    <th className="text-right pb-3">Annual Dividend</th>
                    <th className="text-right pb-3">Total Annual</th>
                    <th className="text-right pb-3">Total Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {directors.map((d, i) => {
                    const annualDiv = d.name === 'Peter' ? annualDividends.peter : annualDividends.wojtek
                    const totalAnnual = d.monthlyWage * 12 + annualDiv
                    return (
                      <tr key={i} className="border-t" style={{ borderColor: '#F5F5F5' }}>
                        <td className="py-3 font-bold" style={{ color: '#1E2333' }}>{d.name}</td>
                        <td className="py-3 text-right" style={{ color: '#676D82' }}>{formatCurrency(d.monthlyWage)}</td>
                        <td className="py-3 text-right" style={{ color: '#676D82' }}>{formatCurrency(d.monthlyWage * 12)}</td>
                        <td className="py-3 text-right" style={{ color: '#65B863' }}>{formatCurrency(annualDiv)}</td>
                        <td className="py-3 text-right font-bold" style={{ color: '#1E2333' }}>{formatCurrency(totalAnnual)}</td>
                        <td className="py-3 text-right font-bold" style={{ color: '#dfd300' }}>{formatCurrency(totalAnnual / 12)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ CASH FLOW TAB ═══ */}
        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#1E2333' }}>Cash Flow Forecast — {financialYear}</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold" style={{ color: '#676D82' }}>Opening Balance: £</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 rounded-lg border text-sm font-bold outline-none focus:border-[#dfd300]"
                  style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                />
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-bold border-b" style={{ color: '#AFB0B3', borderColor: '#EAEDE6' }}>
                      <th className="text-left p-3 sticky left-0 bg-white">Month</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Expenses</th>
                      <th className="text-right p-3">Dir. Wages</th>
                      <th className="text-right p-3">Net Profit</th>
                      <th className="text-right p-3">Peter Div</th>
                      <th className="text-right p-3">Wojtek Div</th>
                      <th className="text-right p-3 font-bold">Cash Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyForecast.map((m, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: '#F5F5F5' }}>
                        <td className="p-3 font-bold sticky left-0 bg-white" style={{ color: '#1E2333' }}>{m.month} {financialYear}</td>
                        <td className="p-3 text-right" style={{ color: '#65B863' }}>{formatCurrency(m.revenue)}</td>
                        <td className="p-3 text-right" style={{ color: '#EF4444' }}>{formatCurrency(m.expenses)}</td>
                        <td className="p-3 text-right" style={{ color: '#F59E0B' }}>{formatCurrency(m.directorWages)}</td>
                        <td className="p-3 text-right font-bold" style={{ color: m.netProfit >= 0 ? '#65B863' : '#EF4444' }}>{formatCurrency(m.netProfit)}</td>
                        <td className="p-3 text-right" style={{ color: '#F87D4D' }}>{formatCurrency(m.dividendsPeter)}</td>
                        <td className="p-3 text-right" style={{ color: '#65B863' }}>{formatCurrency(m.dividendsWojtek)}</td>
                        <td className="p-3 text-right font-bold" style={{ color: m.cumulativeCash >= 0 ? '#1E2333' : '#EF4444' }}>{formatCurrency(m.cumulativeCash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1E2333' }}>Cumulative Cash Position</h3>
              <div className="flex items-end gap-3 h-64">
                {monthlyForecast.map((m, i) => {
                  const height = maxCashFlow > 0 ? Math.abs(m.cumulativeCash) / maxCashFlow * 100 : 0
                  const isNegative = m.cumulativeCash < 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold" style={{ color: isNegative ? '#EF4444' : '#65B863' }}>
                        {formatCompact(m.cumulativeCash)}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                            backgroundColor: isNegative ? '#FCA5A5' : '#86EFAC',
                            border: `2px solid ${isNegative ? '#EF4444' : '#22C55E'}`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#AFB0B3' }}>{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ P&L STATEMENT TAB ═══ */}
        {activeTab === 'pnl' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#1E2333' }}>Profit & Loss Statement — {financialYear}</h2>

            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
              <table className="w-full text-sm">
                <tbody>
                  {/* Revenue Section */}
                  <tr style={{ backgroundColor: '#F0FDF4' }}>
                    <td className="p-4 font-bold text-base" style={{ color: '#166534' }} colSpan={2}>Revenue</td>
                  </tr>
                  {venues.filter(v => revenueByVenue[v.id] > 0).map(v => (
                    <tr key={v.id} className="border-t" style={{ borderColor: '#F5F5F5' }}>
                      <td className="p-4 pl-8" style={{ color: '#676D82' }}>{v.name}</td>
                      <td className="p-4 text-right font-bold" style={{ color: '#65B863' }}>{formatCurrency(revenueByVenue[v.id])}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2" style={{ borderColor: '#22C55E' }}>
                    <td className="p-4 font-bold" style={{ color: '#166534' }}>Total Revenue</td>
                    <td className="p-4 text-right font-bold text-base" style={{ color: '#166534' }}>{formatCurrency(totalAnnualRevenue)}</td>
                  </tr>

                  {/* Expenses Section */}
                  <tr style={{ backgroundColor: '#FEF2F2' }}>
                    <td className="p-4 font-bold text-base" style={{ color: '#991B1B' }} colSpan={2}>Operating Expenses</td>
                  </tr>
                  {expenses.filter(e => e.monthlyAmount > 0).map(e => (
                    <tr key={e.id} className="border-t" style={{ borderColor: '#F5F5F5' }}>
                      <td className="p-4 pl-8" style={{ color: '#676D82' }}>{e.name}</td>
                      <td className="p-4 text-right font-bold" style={{ color: '#EF4444' }}>({formatCurrency(e.monthlyAmount * 12)})</td>
                    </tr>
                  ))}
                  <tr className="border-t-2" style={{ borderColor: '#EF4444' }}>
                    <td className="p-4 font-bold" style={{ color: '#991B1B' }}>Total Operating Expenses</td>
                    <td className="p-4 text-right font-bold text-base" style={{ color: '#991B1B' }}>({formatCurrency(totalAnnualExpenses)})</td>
                  </tr>

                  {/* Gross Profit */}
                  <tr style={{ backgroundColor: '#F8F9FA' }}>
                    <td className="p-4 font-bold text-base" style={{ color: '#1E2333' }}>Gross Profit</td>
                    <td className="p-4 text-right font-bold text-base" style={{ color: totalAnnualRevenue - totalAnnualExpenses >= 0 ? '#166534' : '#991B1B' }}>
                      {formatCurrency(totalAnnualRevenue - totalAnnualExpenses)}
                      <span className="text-xs ml-2" style={{ color: '#AFB0B3' }}>({grossMargin.toFixed(1)}% margin)</span>
                    </td>
                  </tr>

                  {/* Director Wages */}
                  <tr style={{ backgroundColor: '#FFFBEB' }}>
                    <td className="p-4 font-bold text-base" style={{ color: '#92400E' }} colSpan={2}>Director Wages</td>
                  </tr>
                  {directors.filter(d => d.monthlyWage > 0).map((d, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: '#F5F5F5' }}>
                      <td className="p-4 pl-8" style={{ color: '#676D82' }}>{d.name} — {d.role}</td>
                      <td className="p-4 text-right font-bold" style={{ color: '#F59E0B' }}>({formatCurrency(d.monthlyWage * 12)})</td>
                    </tr>
                  ))}
                  <tr className="border-t-2" style={{ borderColor: '#F59E0B' }}>
                    <td className="p-4 font-bold" style={{ color: '#92400E' }}>Total Director Wages</td>
                    <td className="p-4 text-right font-bold text-base" style={{ color: '#92400E' }}>({formatCurrency(totalAnnualDirectorWages)})</td>
                  </tr>

                  {/* Net Profit */}
                  <tr style={{ backgroundColor: annualNetProfit >= 0 ? '#ECFDF5' : '#FEF2F2', borderTop: '3px solid #1E2333' }}>
                    <td className="p-5 font-bold text-lg" style={{ color: '#1E2333' }}>Net Profit / (Loss)</td>
                    <td className="p-5 text-right font-bold text-xl" style={{ color: annualNetProfit >= 0 ? '#166534' : '#DC2626' }}>
                      {annualNetProfit < 0 ? '(' : ''}{formatCurrency(Math.abs(annualNetProfit))}{annualNetProfit < 0 ? ')' : ''}
                      <span className="text-xs ml-2" style={{ color: '#AFB0B3' }}>({netMargin.toFixed(1)}% net margin)</span>
                    </td>
                  </tr>

                  {/* Dividends */}
                  <tr style={{ backgroundColor: '#EFF6FF' }}>
                    <td className="p-4 font-bold text-base" style={{ color: '#1E40AF' }} colSpan={2}>Dividend Distribution</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: '#F5F5F5' }}>
                    <td className="p-4 pl-8" style={{ color: '#676D82' }}>Peter ({dividendConfig.peterShare}%)</td>
                    <td className="p-4 text-right font-bold" style={{ color: '#F87D4D' }}>{formatCurrency(annualDividends.peter)}</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: '#F5F5F5' }}>
                    <td className="p-4 pl-8" style={{ color: '#676D82' }}>Wojtek ({dividendConfig.wojtekShare}%)</td>
                    <td className="p-4 text-right font-bold" style={{ color: '#65B863' }}>{formatCurrency(annualDividends.wojtek)}</td>
                  </tr>
                  {annualDividends.retained > 0 && (
                    <tr className="border-t" style={{ borderColor: '#F5F5F5' }}>
                      <td className="p-4 pl-8" style={{ color: '#676D82' }}>Retained Earnings ({dividendConfig.retainedEarningsPercent}%)</td>
                      <td className="p-4 text-right font-bold" style={{ color: '#3B82F6' }}>{formatCurrency(annualDividends.retained)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KPICard({ label, value, icon: Icon, colour }: { label: string; value: string; icon: any; colour: string }) {
  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold" style={{ color: '#AFB0B3' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colour}15` }}>
          <Icon size={16} style={{ color: colour }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1E2333' }}>{value}</p>
    </div>
  )
}
