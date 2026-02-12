'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Shield, Receipt, FileText, CheckCircle, AlertCircle, Clock,
  X, ChevronRight, MessageSquare, Send, Download, Eye,
  Loader2, ArrowLeft, DollarSign, User
} from 'lucide-react'

type Invoice = {
  id: string
  coach_id: string
  invoice_month: string
  invoice_year: number
  file_name: string
  file_data?: string
  status: 'submitted' | 'approved' | 'corrections_needed' | 'paid'
  submitted_at: string
  reviewed_at?: string
  paid_at?: string
  admin_comment?: string
  amount?: number
  coaches?: {
    id: string
    name: string
    email: string
  }
}

export default function AdminInvoicesPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Update form
  const [updateForm, setUpdateForm] = useState({
    status: '',
    comment: '',
    amount: '',
  })
  const [updating, setUpdating] = useState(false)

  // Validate persisted session
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

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/coach/invoices?admin=true')
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdminLoggedIn) fetchInvoices()
  }, [isAdminLoggedIn, fetchInvoices])

  // Clear message
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [message])

  // Update invoice
  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice || !updateForm.status) return

    setUpdating(true)
    try {
      const res = await fetch('/api/coach/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          status: updateForm.status,
          adminComment: updateForm.comment || undefined,
          amount: updateForm.amount ? parseFloat(updateForm.amount) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: 'Invoice updated successfully' })
      setSelectedInvoice(null)
      setUpdateForm({ status: '', comment: '', amount: '' })
      fetchInvoices()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
    setUpdating(false)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Submitted' },
      approved: { bg: 'rgba(101, 184, 99, 0.1)', text: '#65B863', label: 'Approved' },
      paid: { bg: 'rgba(101, 184, 99, 0.15)', text: '#22C55E', label: 'Paid' },
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

  const filteredInvoices = statusFilter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === statusFilter)

  // Login screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1E2333 0%, #2a3050 50%, #1E2333 100%)' }}>
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: 'rgba(223,211,0,0.15)' }}>
              <Shield size={28} style={{ color: '#dfd300' }} />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin - Invoice Management</h1>
          </div>

          <div className="rounded-2xl p-8 shadow-2xl bg-white">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Admin PIN</label>
                <input
                  type="password" required value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none text-center text-lg tracking-wider"
                  style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  placeholder="Enter PIN"
                />
              </div>
              {adminError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <AlertCircle size={16} />
                  {adminError}
                </div>
              )}
              <button
                type="submit" disabled={adminLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ backgroundColor: '#dfd300', color: '#1E2333' }}
              >
                {adminLoading ? 'Verifying...' : 'Access Invoices'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/admin" className="text-xs font-medium hover:underline" style={{ color: '#676D82' }}>
                ← Back to Admin Dashboard
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
      <header className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: 'rgba(223, 211, 0, 0.97)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: '#1E2333' }}>
                <ArrowLeft size={18} />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-lg font-bold" style={{ color: '#1E2333' }}>Coach Invoice Management</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 right-4 z-50">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
            style={{ backgroundColor: message.type === 'success' ? '#65B863' : '#DC2626', color: 'white' }}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)}><X size={16} /></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: invoices.length, color: '#3B82F6' },
            { label: 'Submitted', count: invoices.filter(i => i.status === 'submitted').length, color: '#3B82F6' },
            { label: 'Awaiting Payment', count: invoices.filter(i => i.status === 'approved').length, color: '#F87D4D' },
            { label: 'Paid', count: invoices.filter(i => i.status === 'paid').length, color: '#65B863' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4" style={{ border: '1px solid #EAEDE6' }}>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
              <p className="text-xs" style={{ color: '#676D82' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {['all', 'submitted', 'approved', 'corrections_needed', 'paid'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: statusFilter === status ? '#1E2333' : 'white',
                color: statusFilter === status ? 'white' : '#676D82',
                border: '1px solid #EAEDE6',
              }}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin" style={{ color: '#dfd300' }} />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #EAEDE6' }}>
            <Receipt size={48} style={{ color: '#AFB0B3' }} className="mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1E2333' }}>No Invoices</h3>
            <p className="text-sm" style={{ color: '#676D82' }}>No invoices match the current filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map(invoice => (
              <div
                key={invoice.id}
                className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all"
                style={{ border: '1px solid #EAEDE6' }}
                onClick={() => {
                  setSelectedInvoice(invoice)
                  setUpdateForm({
                    status: invoice.status,
                    comment: invoice.admin_comment || '',
                    amount: invoice.amount?.toString() || '',
                  })
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(101,184,99,0.1)' }}>
                      <User size={24} style={{ color: '#65B863' }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: '#1E2333' }}>
                        {invoice.coaches?.name || 'Unknown Coach'}
                      </h3>
                      <p className="text-sm" style={{ color: '#676D82' }}>{invoice.coaches?.email}</p>
                      <p className="text-sm mt-1" style={{ color: '#1E2333' }}>
                        <strong>{invoice.invoice_month}</strong> — {invoice.file_name}
                      </p>
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
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div
            className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <X size={20} style={{ color: '#676D82' }} />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-1" style={{ color: '#1E2333' }}>
                {selectedInvoice.coaches?.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#676D82' }}>{selectedInvoice.invoice_month}</p>

              <div className="space-y-3 mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F7F9FA' }}>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#676D82' }}>File:</span>
                  <span className="text-sm font-medium" style={{ color: '#1E2333' }}>{selectedInvoice.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#676D82' }}>Submitted:</span>
                  <span className="text-sm font-medium" style={{ color: '#1E2333' }}>
                    {new Date(selectedInvoice.submitted_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#676D82' }}>Current Status:</span>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
              </div>

              <form onSubmit={handleUpdateInvoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Update Status</label>
                  <select
                    value={updateForm.status}
                    onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved (Awaiting Payment)</option>
                    <option value="corrections_needed">Corrections Needed</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>Amount (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={updateForm.amount}
                    onChange={e => setUpdateForm({ ...updateForm, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                    placeholder="Enter invoice amount"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E2333' }}>
                    Comment to Coach {updateForm.status === 'corrections_needed' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={updateForm.comment}
                    onChange={e => setUpdateForm({ ...updateForm, comment: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none resize-none"
                    style={{ borderColor: '#EAEDE6', color: '#1E2333' }}
                    rows={3}
                    placeholder="Add a comment (will be sent to coach)"
                    required={updateForm.status === 'corrections_needed'}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm"
                    style={{ backgroundColor: '#F7F9FA', color: '#676D82' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                    style={{ backgroundColor: '#65B863' }}
                  >
                    {updating ? 'Updating...' : 'Update Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
