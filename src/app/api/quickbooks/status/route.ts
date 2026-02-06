import { NextResponse } from 'next/server'
import { isQuickBooksConnected, isRefreshTokenExpiringSoon } from '@/lib/quickbooks'

// GET - Check QuickBooks connection status and token health
export async function GET() {
  const connection = await isQuickBooksConnected()
  const tokenStatus = isRefreshTokenExpiringSoon()

  return NextResponse.json({
    connected: connection.connected,
    error: connection.error,
    refreshToken: {
      daysRemaining: tokenStatus.daysRemaining,
      expiringSoon: tokenStatus.expiring,
      warning: tokenStatus.expiring
        ? `⚠️ QuickBooks refresh token expires in ${tokenStatus.daysRemaining} days. Please re-authorize at /api/quickbooks/auth`
        : null,
    },
  })
}
