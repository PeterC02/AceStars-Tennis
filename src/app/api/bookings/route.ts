import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all bookings (for admin panel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const venue = searchParams.get('venue')
  const status = searchParams.get('status')

  let query = supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (venue && venue !== 'all') {
    query = query.eq('venue', venue)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings: data })
}

// POST - Create a new booking and trigger QuickBooks invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create booking in database
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        venue: body.venue,
        programme_id: body.programmeId,
        programme_name: body.programmeName,
        programme_category: body.programmeCategory,
        parent_name: body.parentName,
        parent_email: body.parentEmail,
        parent_phone: body.parentPhone,
        children: body.children,
        camp_days: body.campDays || null,
        session_preferences: body.sessionPreferences || null,
        total_price: body.totalPrice,
        currency: 'GBP',
        payment_status: 'pending',
        payment_method: 'invoice',
        invoice_status: 'not_sent',
        status: 'pending',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger QuickBooks invoice creation with retry
    try {
      const { createInvoiceFromBooking, isRefreshTokenExpiringSoon } = await import('@/lib/quickbooks')
      
      // Retry up to 2 times for transient failures
      let lastError: any = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await createInvoiceFromBooking(booking, body.hasVAT === true)
          
          // Update booking with QuickBooks IDs
          await supabase
            .from('bookings')
            .update({
              quickbooks_customer_id: result.customerId,
              quickbooks_invoice_id: result.invoiceId,
              invoice_status: 'sent'
            })
            .eq('id', booking.id)
          
          console.log(`Booking created and invoice sent (attempt ${attempt}):`, booking.id)
          lastError = null
          break
        } catch (err: any) {
          lastError = err
          console.error(`QuickBooks attempt ${attempt} failed:`, err.message)
          if (attempt < 2) await new Promise(r => setTimeout(r, 1000))
        }
      }

      if (lastError) {
        console.error('QuickBooks invoice failed after retries (booking still saved):', lastError.message)
        // Mark booking as needing manual invoice
        await supabase
          .from('bookings')
          .update({ invoice_status: 'not_sent', notes: `${booking.notes || ''}\n[Auto] QB invoice failed: ${lastError.message}`.trim() })
          .eq('id', booking.id)
      }

      // Log token expiry warning
      const tokenStatus = isRefreshTokenExpiringSoon()
      if (tokenStatus.expiring) {
        console.warn(`[QuickBooks] ⚠️ Refresh token expires in ${tokenStatus.daysRemaining} days! Re-authorize at /api/quickbooks/auth`)
      }
    } catch (qbError: any) {
      console.error('QuickBooks error (booking still saved):', qbError.message)
    }

    // Send confirmation email to parent
    try {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey && body.parentEmail) {
        const childNames = (body.children || []).map((c: any) => c.name).filter(Boolean).join(', ')
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'AceStars Tennis <noreply@acestars.co.uk>',
            to: [body.parentEmail],
            subject: `Booking Confirmation - ${body.programmeName || 'Tennis Coaching'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1E2333; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #dfd300; margin: 0; font-size: 24px;">AceStars Tennis</h1>
                  <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0;">Booking Confirmation</p>
                </div>
                <div style="padding: 32px; background: #ffffff; border: 1px solid #EAEDE6;">
                  <p style="color: #1E2333; font-size: 16px;">Hi ${body.parentName},</p>
                  <p style="color: #676D82;">Thank you for booking with Acestars Tennis Coaching. Here are your booking details:</p>
                  <div style="background: #F7F9FA; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 6px 0; color: #676D82;">Programme:</td><td style="padding: 6px 0; font-weight: bold; color: #1E2333;">${body.programmeName || 'N/A'}</td></tr>
                      <tr><td style="padding: 6px 0; color: #676D82;">Venue:</td><td style="padding: 6px 0; font-weight: bold; color: #1E2333;">${body.venue || 'N/A'}</td></tr>
                      ${childNames ? `<tr><td style="padding: 6px 0; color: #676D82;">Child(ren):</td><td style="padding: 6px 0; font-weight: bold; color: #1E2333;">${childNames}</td></tr>` : ''}
                      <tr><td style="padding: 6px 0; color: #676D82;">Total:</td><td style="padding: 6px 0; font-weight: bold; color: #1E2333;">&pound;${(body.totalPrice || 0).toFixed(2)}</td></tr>
                      <tr><td style="padding: 6px 0; color: #676D82;">Booking Ref:</td><td style="padding: 6px 0; font-weight: bold; color: #1E2333;">${booking.id?.slice(0, 8).toUpperCase() || 'N/A'}</td></tr>
                    </table>
                  </div>
                  <p style="color: #676D82;">An invoice will be sent separately. If you have any questions, please contact us at <a href="mailto:acestarsbookings@gmail.com" style="color: #F87D4D;">acestarsbookings@gmail.com</a>.</p>
                  <p style="color: #1E2333; font-weight: bold;">See you on the court!</p>
                  <p style="color: #676D82;">The Acestars Team</p>
                </div>
                <div style="padding: 16px; text-align: center; background: #F7F9FA; border-radius: 0 0 12px 12px; border: 1px solid #EAEDE6; border-top: 0;">
                  <p style="color: #AFB0B3; font-size: 11px; margin: 0;">Acestars Limited &bull; 15 Camperdown House, Windsor, Berkshire SL4 3HQ</p>
                </div>
              </div>
            `,
          }),
        })
        console.log('[BOOKING] Confirmation email sent to', body.parentEmail)
      }
    } catch (emailErr: any) {
      console.error('[BOOKING] Confirmation email failed:', emailErr.message)
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
