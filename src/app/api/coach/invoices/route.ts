import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Send invoice notification email
async function sendInvoiceEmail(coachName: string, fileName: string, invoiceMonth: string, fileData: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log(`[INVOICE EMAIL] Invoice from ${coachName} for ${invoiceMonth} (no RESEND_API_KEY set)`)
    return true
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AceStars Tennis <noreply@acestars.co.uk>',
        to: ['acestarsbookings@gmail.com'],
        subject: `Coach Invoice Submitted - ${coachName} - ${invoiceMonth}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1E2333; font-size: 24px; margin: 0;">New Coach Invoice</h1>
              <p style="color: #676D82; font-size: 14px; margin-top: 8px;">AceStars Tennis Coaching</p>
            </div>
            <div style="background: #F7F9FA; border-radius: 16px; padding: 30px;">
              <p style="color: #1E2333; font-size: 16px; margin: 0 0 16px;"><strong>Coach:</strong> ${coachName}</p>
              <p style="color: #1E2333; font-size: 16px; margin: 0 0 16px;"><strong>Invoice Period:</strong> ${invoiceMonth}</p>
              <p style="color: #1E2333; font-size: 16px; margin: 0 0 16px;"><strong>File:</strong> ${fileName}</p>
              <p style="color: #676D82; font-size: 14px; margin-top: 24px;">Please review this invoice in the Admin Dashboard.</p>
            </div>
          </div>
        `,
        attachments: fileData ? [{
          filename: fileName,
          content: fileData.split(',')[1] || fileData, // Remove data URL prefix if present
        }] : undefined,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[INVOICE EMAIL] Failed to send:', err)
    return false
  }
}

// Send status update email to coach
async function sendStatusUpdateEmail(coachEmail: string, coachName: string, invoiceMonth: string, status: string, comment?: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log(`[INVOICE STATUS EMAIL] Status update for ${coachEmail}: ${status}`)
    return true
  }

  const statusMessages: Record<string, { title: string; color: string; message: string }> = {
    approved: {
      title: 'Invoice Approved',
      color: '#65B863',
      message: 'Your invoice has been approved and payment will be processed shortly.',
    },
    paid: {
      title: 'Invoice Paid',
      color: '#65B863',
      message: 'Your invoice has been paid. Thank you!',
    },
    corrections_needed: {
      title: 'Corrections Needed',
      color: '#F87D4D',
      message: 'Your invoice requires some corrections before it can be approved.',
    },
  }

  const statusInfo = statusMessages[status] || { title: 'Invoice Update', color: '#676D82', message: 'Your invoice status has been updated.' }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AceStars Tennis <noreply@acestars.co.uk>',
        to: [coachEmail],
        subject: `Invoice Update - ${invoiceMonth} - ${statusInfo.title}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1E2333; font-size: 24px; margin: 0;">Invoice Update</h1>
              <p style="color: #676D82; font-size: 14px; margin-top: 8px;">AceStars Tennis Coaching</p>
            </div>
            <div style="background: #F7F9FA; border-radius: 16px; padding: 30px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; color: white; background-color: ${statusInfo.color};">
                  ${statusInfo.title}
                </span>
              </div>
              <p style="color: #1E2333; font-size: 16px; margin: 0 0 16px;">Hi ${coachName},</p>
              <p style="color: #676D82; font-size: 14px; margin: 0 0 16px;">${statusInfo.message}</p>
              <p style="color: #1E2333; font-size: 14px; margin: 0 0 8px;"><strong>Invoice Period:</strong> ${invoiceMonth}</p>
              ${comment ? `
                <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid ${statusInfo.color};">
                  <p style="color: #1E2333; font-size: 14px; margin: 0 0 8px;"><strong>Admin Comment:</strong></p>
                  <p style="color: #676D82; font-size: 14px; margin: 0;">${comment}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[INVOICE STATUS EMAIL] Failed to send:', err)
    return false
  }
}

// GET - Fetch invoices for a coach or all invoices (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachId = searchParams.get('coachId')
    const isAdmin = searchParams.get('admin') === 'true'

    let query = supabase
      .from('coach_invoices')
      .select(`
        *,
        coaches (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (coachId && !isAdmin) {
      query = query.eq('coach_id', coachId)
    }

    // Only show invoices from the last year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    query = query.gte('created_at', oneYearAgo.toISOString())

    const { data: invoices, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invoices: invoices || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Submit a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coachId, coachName, coachEmail, invoiceMonth, invoiceYear, fileName, fileData } = body

    if (!coachId || !invoiceMonth || !invoiceYear || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate submission
    const { data: existing } = await supabase
      .from('coach_invoices')
      .select('id')
      .eq('coach_id', coachId)
      .eq('invoice_month', invoiceMonth)
      .eq('invoice_year', invoiceYear)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'An invoice for this period has already been submitted' }, { status: 409 })
    }

    // Insert invoice
    const { data: invoice, error } = await supabase
      .from('coach_invoices')
      .insert({
        coach_id: coachId,
        invoice_month: invoiceMonth,
        invoice_year: invoiceYear,
        file_name: fileName,
        file_data: fileData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year retention
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send email notification
    await sendInvoiceEmail(coachName, fileName, invoiceMonth, fileData)

    return NextResponse.json({ invoice, message: 'Invoice submitted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update invoice status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, status, adminComment, amount } = body

    if (!invoiceId || !status) {
      return NextResponse.json({ error: 'Invoice ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['submitted', 'approved', 'corrections_needed', 'paid']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the invoice with coach info
    const { data: existingInvoice } = await supabase
      .from('coach_invoices')
      .select(`
        *,
        coaches (
          id,
          name,
          email
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    }

    if (adminComment !== undefined) {
      updateData.admin_comment = adminComment
    }

    if (amount !== undefined) {
      updateData.amount = amount
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { data: invoice, error } = await supabase
      .from('coach_invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send status update email to coach
    if (existingInvoice.coaches && ['approved', 'paid', 'corrections_needed'].includes(status)) {
      await sendStatusUpdateEmail(
        existingInvoice.coaches.email,
        existingInvoice.coaches.name,
        existingInvoice.invoice_month,
        status,
        adminComment
      )
    }

    return NextResponse.json({ invoice, message: 'Invoice updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
