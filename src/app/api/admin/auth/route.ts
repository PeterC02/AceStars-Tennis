import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Server-side PIN validation — PINs stored as env vars, never exposed to client
const ADMIN_PIN_HASH = crypto.createHash('sha256').update(process.env.ADMIN_PIN || '2002').digest('hex')
const COACH_PIN_HASH = crypto.createHash('sha256').update(process.env.COACH_PIN || '2026').digest('hex')

// Rate limiting: track attempts per IP
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false
  }

  record.count++
  return true
}

// Generate a session token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Active sessions (in production, use Redis or DB)
const sessions = new Map<string, { role: 'admin' | 'coach'; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { action, pin, token } = await request.json()

    // Validate existing session
    if (action === 'validate') {
      if (!token) {
        return NextResponse.json({ valid: false }, { status: 401 })
      }
      const session = sessions.get(token)
      if (!session || Date.now() > session.expiresAt) {
        sessions.delete(token)
        return NextResponse.json({ valid: false }, { status: 401 })
      }
      return NextResponse.json({ valid: true, role: session.role })
    }

    // Login
    if (action === 'login') {
      if (!pin) {
        return NextResponse.json({ error: 'PIN is required' }, { status: 400 })
      }

      const pinHash = crypto.createHash('sha256').update(pin).digest('hex')

      if (pinHash === ADMIN_PIN_HASH) {
        const token = generateToken()
        sessions.set(token, { role: 'admin', expiresAt: Date.now() + 24 * 60 * 60 * 1000 }) // 24h
        return NextResponse.json({ success: true, role: 'admin', token })
      }

      if (pinHash === COACH_PIN_HASH) {
        const token = generateToken()
        sessions.set(token, { role: 'coach', expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
        return NextResponse.json({ success: true, role: 'coach', token })
      }

      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
    }

    // Logout
    if (action === 'logout') {
      if (token) sessions.delete(token)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
