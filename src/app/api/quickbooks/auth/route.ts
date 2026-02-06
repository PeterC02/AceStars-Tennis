import { NextResponse } from 'next/server'
import { generateOAuthState } from '@/lib/quickbooks'

// QuickBooks OAuth 2.0 - Step 1: Redirect to QuickBooks authorization
// Uses CSRF state token for protection (handles requirement d)
export async function GET() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/quickbooks/callback`
  const scope = 'com.intuit.quickbooks.accounting'
  const state = generateOAuthState()

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`

  return NextResponse.redirect(authUrl)
}
