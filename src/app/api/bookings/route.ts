import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    return NextResponse.json({ booking })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
