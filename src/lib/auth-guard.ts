import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AuthResult = {
  authenticated: boolean
  teacherId?: string
  teacherName?: string
  division?: string | null
  isCoach?: boolean
  error?: string
}

/**
 * Validate a teacher/div-master session from request headers.
 * Expects: Authorization: Bearer <teacher-id> or X-Teacher-Id header.
 * In production, use proper JWT tokens.
 */
export async function validateTeacherAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization')
  const teacherId = request.headers.get('x-teacher-id') || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null)

  if (!teacherId) {
    return { authenticated: false, error: 'No authentication provided' }
  }

  // Coach account — special case
  if (teacherId === 'coach-account') {
    return { authenticated: true, teacherId, teacherName: 'Coach', isCoach: true }
  }

  // Validate against DB
  try {
    const { data: teacher, error } = await supabase
      .from('div_masters')
      .select('id, name, division, is_active')
      .eq('id', teacherId)
      .eq('is_active', true)
      .single()

    if (error || !teacher) {
      return { authenticated: false, error: 'Invalid or inactive account' }
    }

    return {
      authenticated: true,
      teacherId: teacher.id,
      teacherName: teacher.name,
      division: teacher.division,
    }
  } catch {
    return { authenticated: false, error: 'Authentication check failed' }
  }
}

/**
 * Helper to return a 401 response for unauthenticated requests.
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}
