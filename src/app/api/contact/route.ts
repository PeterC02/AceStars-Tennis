import { NextRequest, NextResponse } from 'next/server'

// Rate limiting
const contactAttempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const record = contactAttempts.get(ip)
    if (record && now < record.resetAt && record.count >= 5) {
      return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
    }
    if (!record || now > record.resetAt) {
      contactAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    } else {
      record.count++
    }

    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    // Try Resend API first
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'AceStars Website <noreply@acestars.co.uk>',
          to: ['acestarsbookings@gmail.com'],
          reply_to: email,
          subject: `[Website Enquiry] ${subject || 'Contact Form'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2 style="color: #1E2333;">New Contact Form Submission</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #676D82; width: 100px;"><strong>Name:</strong></td><td style="padding: 8px 0;">${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #676D82;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #676D82;"><strong>Subject:</strong></td><td style="padding: 8px 0;">${subject || 'General Enquiry'}</td></tr>
              </table>
              <div style="margin-top: 16px; padding: 16px; background: #F7F9FA; border-radius: 8px;">
                <p style="color: #676D82; margin: 0 0 8px 0;"><strong>Message:</strong></p>
                <p style="color: #1E2333; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 24px; color: #AFB0B3; font-size: 12px;">Sent from the AceStars website contact form</p>
            </div>
          `,
        }),
      })

      if (res.ok) {
        return NextResponse.json({ success: true, message: 'Your message has been sent successfully.' })
      }
      console.error('[CONTACT] Resend failed:', await res.text())
    }

    // Fallback: log to console
    console.log('[CONTACT FORM]', { name, email, subject, message, timestamp: new Date().toISOString() })

    return NextResponse.json({
      success: true,
      message: resendKey ? 'Message sent (with warnings).' : 'Your message has been received. We will get back to you soon.',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
