import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex')
}

// POST - Login with email + PIN
export async function POST(request: NextRequest) {
  try {
    const { action, email, pin, name, division } = await request.json()

    if (action === 'login') {
      const { data: teacher, error } = await supabase
        .from('div_masters')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single()

      if (error || !teacher) {
        return NextResponse.json({ error: 'Account not found' }, { status: 401 })
      }

      if (teacher.pin_hash !== hashPin(pin)) {
        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
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

    if (action === 'register') {
      if (!email || !pin || !name) {
        return NextResponse.json({ error: 'Name, email and PIN are required' }, { status: 400 })
      }

      if (pin.length < 4 || pin.length > 6) {
        return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 })
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from('div_masters')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      }

      const { data: teacher, error } = await supabase
        .from('div_masters')
        .insert({
          name,
          email: email.toLowerCase().trim(),
          pin_hash: hashPin(pin),
          division: division || null,
        })
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
