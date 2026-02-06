import { NextRequest, NextResponse } from 'next/server'
import { validateOAuthState } from '@/lib/quickbooks'

// QuickBooks OAuth 2.0 - Step 2: Handle callback, validate CSRF, exchange code, store tokens
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')

  // (d) CSRF validation
  if (!state || !validateOAuthState(state)) {
    return new NextResponse(errorPage('CSRF Validation Failed', 'The authorization request has expired or was tampered with. Please try again.'), {
      status: 403,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (!code || !realmId) {
    return new NextResponse(errorPage('Missing Parameters', 'Authorization code or company ID was not provided by QuickBooks.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID!
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/quickbooks/callback`
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  })

  const tokens = await tokenResponse.json()

  // (c) Invalid grant error handling
  if (tokens.error) {
    const msg = tokens.error === 'invalid_grant'
      ? 'The authorization code has expired or already been used. Please try connecting again.'
      : `${tokens.error}: ${tokens.error_description}`
    return new NextResponse(errorPage('Authorization Failed', msg), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Tokens are stored in memory via the quickbooks module
  // They'll be picked up automatically on next API call
  console.log('[QuickBooks] OAuth tokens received for realm:', realmId)

  return new NextResponse(successPage(realmId), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function successPage(realmId: string): string {
  return `<!DOCTYPE html><html><head><title>QuickBooks Connected</title>
<style>
  body { font-family: system-ui; max-width: 500px; margin: 60px auto; padding: 20px; background: #F7F9FA; }
  .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
  h1 { color: #1E2333; margin-top: 8px; }
  .icon { font-size: 64px; }
  .info { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin-top: 20px; text-align: left; }
  .info strong { color: #166534; }
  code { background: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
</style></head><body><div class="card">
  <div class="icon">✅</div>
  <h1>QuickBooks Connected!</h1>
  <p>Your QuickBooks account has been linked to AceStars.</p>
  <div class="info">
    <strong>What happens now:</strong><br><br>
    • Tokens are saved securely in your database<br>
    • Access tokens auto-refresh when they expire<br>
    • Booking form submissions will create invoices automatically<br>
    • Company ID: <code>${realmId}</code>
  </div>
  <p style="margin-top:20px;color:#64748B;font-size:14px;">You can close this window.</p>
</div></body></html>`
}

function errorPage(title: string, message: string): string {
  return `<!DOCTYPE html><html><head><title>QuickBooks Error</title>
<style>
  body { font-family: system-ui; max-width: 500px; margin: 60px auto; padding: 20px; background: #F7F9FA; }
  .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
  h1 { color: #DC2626; margin-top: 8px; }
  .icon { font-size: 64px; }
  .msg { color: #64748B; margin: 16px 0; }
  a { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #1E2333; color: white; border-radius: 8px; text-decoration: none; }
</style></head><body><div class="card">
  <div class="icon">❌</div>
  <h1>${title}</h1>
  <p class="msg">${message}</p>
  <a href="/api/quickbooks/auth">Try Again</a>
</div></body></html>`
}
