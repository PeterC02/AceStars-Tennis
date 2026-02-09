import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex')
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification email via Resend (or fallback to console log)
async function sendVerificationEmail(email: string, code: string, name: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log(`[EMAIL VERIFICATION] Code for ${email}: ${code} (no RESEND_API_KEY set)`)
    return true
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AceStars Tennis <noreply@acestars.co.uk>',
        to: [email],
        subject: 'Your Div Master Portal Verification Code',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1E2333; font-size: 24px; margin: 0;">Div Master Portal</h1>
              <p style="color: #676D82; font-size: 14px; margin-top: 8px;">AceStars Tennis at Ludgrove School</p>
            </div>
            <div style="background: #F7F9FA; border-radius: 16px; padding: 30px; text-align: center;">
              <p style="color: #676D82; font-size: 14px; margin: 0 0 16px;">Hi ${name || 'there'}, here is your verification code:</p>
              <div style="background: white; border: 2px solid #EAEDE6; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 200px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #F87D4D;">${code}</span>
              </div>
              <p style="color: #AFB0B3; font-size: 12px; margin-top: 16px;">This code expires in 10 minutes.</p>
            </div>
            <p style="color: #AFB0B3; font-size: 11px; text-align: center; margin-top: 24px;">If you did not request this code, please ignore this email.</p>
          </div>
        `,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[EMAIL VERIFICATION] Failed to send:', err)
    return false
  }
}

// Rate limiting: track attempts per email
const authAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_AUTH_ATTEMPTS = 5
const AUTH_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkAuthRateLimit(email: string): boolean {
  const now = Date.now()
  const record = authAttempts.get(email)
  if (!record || now > record.resetAt) {
    authAttempts.set(email, { count: 1, resetAt: now + AUTH_WINDOW_MS })
    return true
  }
  if (record.count >= MAX_AUTH_ATTEMPTS) return false
  record.count++
  return true
}

// Persistent verification codes via Supabase (with in-memory fallback)
const verificationCodesFallback = new Map<string, { code: string; expiresAt: number; teacherData: any; action: string }>()

async function storeVerificationCode(email: string, code: string, teacherData: any, action: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  try {
    await supabase.from('verification_codes').upsert({
      email,
      code,
      teacher_data: teacherData,
      action,
      expires_at: expiresAt,
    }, { onConflict: 'email' })
  } catch {
    // Fallback to in-memory if table doesn't exist
    verificationCodesFallback.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000, teacherData, action })
  }
}

async function getVerificationCode(email: string): Promise<{ code: string; teacherData: any; action: string; expired: boolean } | null> {
  try {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      // Fallback to in-memory
      const fallback = verificationCodesFallback.get(email)
      if (!fallback) return null
      return { code: fallback.code, teacherData: fallback.teacherData, action: fallback.action, expired: Date.now() > fallback.expiresAt }
    }

    return {
      code: data.code,
      teacherData: data.teacher_data,
      action: data.action,
      expired: new Date(data.expires_at).getTime() < Date.now(),
    }
  } catch {
    const fallback = verificationCodesFallback.get(email)
    if (!fallback) return null
    return { code: fallback.code, teacherData: fallback.teacherData, action: fallback.action, expired: Date.now() > fallback.expiresAt }
  }
}

async function deleteVerificationCode(email: string) {
  try {
    await supabase.from('verification_codes').delete().eq('email', email)
  } catch {}
  verificationCodesFallback.delete(email)
}

// POST - Login with email + PIN + email verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, pin, name, division, code } = body

    // Step 1: Login — validate credentials, then send verification code
    if (action === 'login') {
      const emailKey = email?.toLowerCase().trim()
      if (!emailKey || !checkAuthRateLimit(emailKey)) {
        return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 })
      }

      const { data: teacher, error } = await supabase
        .from('div_masters')
        .select('*')
        .eq('email', emailKey)
        .eq('is_active', true)
        .single()

      if (error || !teacher) {
        return NextResponse.json({ error: 'Account not found' }, { status: 401 })
      }

      if (teacher.pin_hash !== hashPin(pin)) {
        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
      }

      // Generate and send verification code
      const verifyCode = generateCode()
      await storeVerificationCode(emailKey, verifyCode, { id: teacher.id, name: teacher.name, email: teacher.email, division: teacher.division }, 'login')
      await sendVerificationEmail(emailKey, verifyCode, teacher.name)

      return NextResponse.json({
        requiresVerification: true,
        message: `Verification code sent to ${emailKey}`,
      })
    }

    // Step 1: Register — validate input, then send verification code
    if (action === 'register') {
      if (!email || !pin || !name) {
        return NextResponse.json({ error: 'Name, email and PIN are required' }, { status: 400 })
      }

      const emailKey = email.toLowerCase().trim()
      if (!checkAuthRateLimit(emailKey)) {
        return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 })
      }

      if (pin.length < 4 || pin.length > 6) {
        return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 })
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from('div_masters')
        .select('id')
        .eq('email', emailKey)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      }

      // Generate and send verification code (don't create account yet)
      const verifyCode = generateCode()
      await storeVerificationCode(emailKey, verifyCode, { name, email: emailKey, pin_hash: hashPin(pin), division: division || null }, 'register')
      await sendVerificationEmail(emailKey, verifyCode, name)

      return NextResponse.json({
        requiresVerification: true,
        message: `Verification code sent to ${emailKey}`,
      })
    }

    // Step 2: Verify code and complete login/register
    if (action === 'verify_code') {
      if (!email || !code) {
        return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
      }

      const emailKey = email.toLowerCase().trim()
      const stored = await getVerificationCode(emailKey)

      if (!stored) {
        return NextResponse.json({ error: 'No verification code found. Please try logging in again.' }, { status: 400 })
      }

      if (stored.expired) {
        await deleteVerificationCode(emailKey)
        return NextResponse.json({ error: 'Verification code has expired. Please try again.' }, { status: 400 })
      }

      if (stored.code !== code) {
        return NextResponse.json({ error: 'Incorrect verification code' }, { status: 401 })
      }

      // Code is valid — clean up
      await deleteVerificationCode(emailKey)

      if (stored.action === 'login') {
        return NextResponse.json({ teacher: stored.teacherData })
      }

      if (stored.action === 'register') {
        // Now actually create the account
        const { data: teacher, error } = await supabase
          .from('div_masters')
          .insert(stored.teacherData)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
          teacher: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            division: teacher.division,
          }
        })
      }
    }

    // Resend verification code
    if (action === 'resend_code') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const emailKey = email.toLowerCase().trim()
      const stored = await getVerificationCode(emailKey)

      if (!stored) {
        return NextResponse.json({ error: 'No pending verification. Please try logging in again.' }, { status: 400 })
      }

      // Generate new code and update
      const newCode = generateCode()
      await storeVerificationCode(emailKey, newCode, stored.teacherData, stored.action)

      await sendVerificationEmail(emailKey, newCode, stored.teacherData.name)

      return NextResponse.json({ message: `New code sent to ${emailKey}` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
