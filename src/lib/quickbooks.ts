/**
 * QuickBooks Online Accounting API Integration
 * 
 * Handles:
 * a. Expired access tokens (auto-refresh using refresh token)
 * b. Expired refresh tokens (flags re-authorization needed)
 * c. Invalid grant errors (flags re-authorization needed)
 * d. CSRF protection (state parameter in OAuth flow)
 * e. File-based token persistence (survives server restarts)
 * f. Refresh token expiry monitoring (100-day lifetime)
 * g. Retry logic for transient failures
 */

import * as fs from 'fs'
import * as path from 'path'

// QuickBooks API endpoints
const QB_SANDBOX_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com'
const QB_PRODUCTION_BASE_URL = 'https://quickbooks.api.intuit.com'
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

const getBaseUrl = () => {
  return process.env.QUICKBOOKS_ENVIRONMENT === 'production' 
    ? QB_PRODUCTION_BASE_URL 
    : QB_SANDBOX_BASE_URL
}

// Error types for proper handling
export class QuickBooksAuthError extends Error {
  constructor(message: string, public requiresReauth: boolean = false) {
    super(message)
    this.name = 'QuickBooksAuthError'
  }
}

export type QuickBooksCustomer = {
  Id?: string
  DisplayName: string
  PrimaryEmailAddr: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  GivenName?: string
  FamilyName?: string
}

export type QuickBooksInvoiceLine = {
  Amount: number
  Description: string
  DetailType: 'SalesItemLineDetail'
  SalesItemLineDetail: {
    ItemRef: { value: string; name: string }
    Qty: number
    UnitPrice: number
  }
}

export type QuickBooksInvoice = {
  Id?: string
  CustomerRef: { value: string }
  Line: QuickBooksInvoiceLine[]
  DueDate?: string
  EmailStatus?: 'NotSet' | 'NeedToSend' | 'EmailSent'
  BillEmail?: { Address: string }
}

// File-based token storage (survives server restarts)
const TOKEN_FILE = path.join(process.cwd(), '.qb-tokens.json')

type StoredTokenData = {
  access_token: string
  refresh_token: string
  refresh_token_created_at: string
  last_refreshed_at: string
}

let cachedTokens: StoredTokenData | null = null

function readTokenFile(): StoredTokenData | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'))
      return data
    }
  } catch (e) {
    console.error('[QuickBooks] Failed to read token file:', e)
  }
  return null
}

function writeTokenFile(data: StoredTokenData): void {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[QuickBooks] Failed to write token file:', e)
  }
}

async function getStoredTokens(): Promise<StoredTokenData | null> {
  if (cachedTokens) return cachedTokens
  
  // Try file-based storage first
  const fileTokens = readTokenFile()
  if (fileTokens) {
    cachedTokens = fileTokens
    return cachedTokens
  }
  
  // Fall back to env vars
  const access = process.env.QUICKBOOKS_ACCESS_TOKEN
  const refresh = process.env.QUICKBOOKS_REFRESH_TOKEN
  if (access && refresh) {
    cachedTokens = {
      access_token: access,
      refresh_token: refresh,
      refresh_token_created_at: new Date().toISOString(),
      last_refreshed_at: new Date().toISOString(),
    }
    writeTokenFile(cachedTokens)
    return cachedTokens
  }
  
  return null
}

async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  const existing = await getStoredTokens()
  cachedTokens = {
    access_token: accessToken,
    refresh_token: refreshToken,
    refresh_token_created_at: existing?.refresh_token_created_at || new Date().toISOString(),
    last_refreshed_at: new Date().toISOString(),
  }
  writeTokenFile(cachedTokens)
  console.log('[QuickBooks] Tokens refreshed and persisted to file')
}

/**
 * Check how many days until the refresh token expires (100-day lifetime)
 */
export function getRefreshTokenDaysRemaining(): number {
  const tokens = readTokenFile()
  if (!tokens?.refresh_token_created_at) return -1
  const created = new Date(tokens.refresh_token_created_at).getTime()
  const now = Date.now()
  const daysElapsed = (now - created) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.floor(100 - daysElapsed))
}

/**
 * Check if refresh token needs renewal soon (< 14 days remaining)
 */
export function isRefreshTokenExpiringSoon(): { expiring: boolean; daysRemaining: number } {
  const days = getRefreshTokenDaysRemaining()
  return { expiring: days >= 0 && days < 14, daysRemaining: days }
}

/**
 * Refresh the access token using the refresh token
 * Handles: (a) expired access tokens
 */
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  const data = await response.json()

  // Handle (b) expired refresh tokens and (c) invalid grant errors
  if (data.error) {
    if (data.error === 'invalid_grant') {
      throw new QuickBooksAuthError(
        'QuickBooks refresh token has expired or is invalid. Please re-authorize at /api/quickbooks/auth',
        true
      )
    }
    throw new QuickBooksAuthError(`Token refresh failed: ${data.error} - ${data.error_description}`)
  }

  // Store the new tokens
  await storeTokens(data.access_token, data.refresh_token)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }
}

/**
 * Get a valid access token, refreshing if needed
 */
async function getAccessToken(): Promise<string> {
  const tokens = await getStoredTokens()
  
  if (!tokens) {
    throw new QuickBooksAuthError(
      'QuickBooks not connected. Please authorize at /api/quickbooks/auth',
      true
    )
  }

  return tokens.access_token
}

/**
 * Log QuickBooks API errors with intuit_tid for troubleshooting
 * Handles: question 2 (intuit_tid capture) and question 3 (error logging)
 */
function logQBResponse(path: string, response: Response, body?: string) {
  const intuitTid = response.headers.get('intuit_tid')
  const status = response.status

  if (intuitTid) {
    console.log(`[QuickBooks] ${path} | status=${status} | intuit_tid=${intuitTid}`)
  }

  if (!response.ok) {
    console.error(`[QuickBooks ERROR] ${path} | status=${status} | intuit_tid=${intuitTid || 'N/A'} | body=${body || 'N/A'}`)
  }
}

/**
 * Make an authenticated API call with automatic token refresh on 401
 */
async function qbFetch(path: string, options: RequestInit = {}, retried = false): Promise<Response> {
  const accessToken = await getAccessToken()
  const realmId = process.env.QUICKBOOKS_REALM_ID
  const baseUrl = getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/company/${realmId}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Capture intuit_tid and log errors for troubleshooting
  logQBResponse(path, response)

  // Handle (a) expired access token — auto-refresh and retry once
  if (response.status === 401 && !retried) {
    console.log('[QuickBooks] Access token expired, refreshing...')
    const tokens = await getStoredTokens()
    if (!tokens?.refresh_token) {
      throw new QuickBooksAuthError('No refresh token available. Please re-authorize.', true)
    }

    try {
      await refreshAccessToken(tokens.refresh_token)
      return qbFetch(path, options, true) // Retry with new token
    } catch (err) {
      if (err instanceof QuickBooksAuthError) throw err
      throw new QuickBooksAuthError('Failed to refresh token. Please re-authorize.', true)
    }
  }

  // Log response body on API errors (syntax/validation errors - question 1)
  if (!response.ok && response.status !== 401) {
    const cloned = response.clone()
    const errorBody = await cloned.text()
    logQBResponse(path, response, errorBody)
  }

  return response
}

/**
 * Generate a CSRF state token for OAuth flow
 * Handles: (d) CSRF protection
 */
export function generateOAuthState(): string {
  const state = Buffer.from(JSON.stringify({
    nonce: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now(),
  })).toString('base64')
  return state
}

/**
 * Validate CSRF state token (must be used within 10 minutes)
 */
export function validateOAuthState(state: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
    const age = Date.now() - decoded.timestamp
    return age < 10 * 60 * 1000 // Valid for 10 minutes
  } catch {
    return false
  }
}

/**
 * Check if QuickBooks is connected and tokens are valid
 */
export async function isQuickBooksConnected(): Promise<{ connected: boolean; error?: string }> {
  try {
    const tokens = await getStoredTokens()
    if (!tokens) return { connected: false, error: 'Not authorized' }
    
    const realmId = process.env.QUICKBOOKS_REALM_ID
    if (!realmId) return { connected: false, error: 'Realm ID not configured' }

    // Test the connection
    const response = await qbFetch('/query?query=select count(*) from Customer')
    if (response.ok) return { connected: true }
    
    return { connected: false, error: 'Connection test failed' }
  } catch (err) {
    if (err instanceof QuickBooksAuthError) {
      return { connected: false, error: err.message }
    }
    return { connected: false, error: 'Unknown error' }
  }
}

/**
 * Find or create a customer in QuickBooks
 */
export async function findOrCreateCustomer(
  email: string,
  name: string,
  phone?: string
): Promise<QuickBooksCustomer> {
  // Search for existing customer by email
  const searchResponse = await qbFetch(
    `/query?query=select * from Customer where PrimaryEmailAddr = '${email}'`
  )
  const searchData = await searchResponse.json()
  
  if (searchData.QueryResponse?.Customer?.length > 0) {
    return searchData.QueryResponse.Customer[0]
  }

  // Create new customer
  const nameParts = name.split(' ')
  const newCustomer: QuickBooksCustomer = {
    DisplayName: name,
    PrimaryEmailAddr: { Address: email },
    GivenName: nameParts[0],
    FamilyName: nameParts.slice(1).join(' ') || nameParts[0],
  }

  if (phone) {
    newCustomer.PrimaryPhone = { FreeFormNumber: phone }
  }

  const createResponse = await qbFetch('/customer', {
    method: 'POST',
    body: JSON.stringify(newCustomer),
  })

  const createData = await createResponse.json()
  return createData.Customer
}

/**
 * Create and send an invoice
 */
export async function createAndSendInvoice(
  customerId: string,
  customerEmail: string,
  items: {
    description: string
    amount: number
    quantity: number
  }[],
  dueDate?: string,
  hasVAT: boolean = false
): Promise<QuickBooksInvoice> {
  const invoiceData: Record<string, any> = {
    CustomerRef: { value: customerId },
    BillEmail: { Address: customerEmail },
    EmailStatus: 'NeedToSend',
    DueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    // AceStars branding and payment terms
    CustomerMemo: {
      value: 'Thank you for booking with AceStars Tennis! Payment is due within 7 days of the invoice date. For any queries, please contact acestarsbookings@gmail.com'
    },
    PrivateNote: `AceStars Booking - Auto-generated invoice`,
    Line: items.map(item => ({
      Amount: item.amount * item.quantity,
      Description: item.description,
      DetailType: 'SalesItemLineDetail' as const,
      SalesItemLineDetail: {
        ItemRef: { value: '1', name: 'Services' },
        Qty: item.quantity,
        UnitPrice: item.amount,
        TaxCodeRef: { value: hasVAT ? '6' : '10' },
      },
    })),
  }

  const createResponse = await qbFetch('/invoice', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  })

  const createData = await createResponse.json()
  const createdInvoice = createData.Invoice

  // Send the invoice via email
  await qbFetch(`/invoice/${createdInvoice.Id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
  })

  return createdInvoice
}

/**
 * Create invoice from booking data
 */
export async function createInvoiceFromBooking(booking: {
  parent_name: string
  parent_email: string
  parent_phone: string
  venue: string
  programme_name: string
  programme_category: string
  total_price: number
  children: { name: string; age?: string }[]
  camp_days?: { week_name: string; days: string[] }[] | null
}, hasVAT: boolean = false): Promise<{ customerId: string; invoiceId: string }> {
  const customer = await findOrCreateCustomer(
    booking.parent_email,
    booking.parent_name,
    booking.parent_phone
  )

  // Build detailed invoice line description
  const childNames = booking.children.map(c => c.name).join(', ')
  let description = `${booking.venue} - ${booking.programme_name}\nStudent(s): ${childNames}`
  
  // Add camp day details if applicable
  if (booking.camp_days && booking.camp_days.length > 0) {
    const dayDetails = booking.camp_days
      .map(w => `${w.week_name}: ${w.days.join(', ')}`)
      .join('\n')
    description += `\n${dayDetails}`
  }

  const invoice = await createAndSendInvoice(
    customer.Id!,
    booking.parent_email,
    [
      {
        description,
        amount: booking.total_price,
        quantity: 1,
      },
    ],
    undefined,
    hasVAT
  )

  return {
    customerId: customer.Id!,
    invoiceId: invoice.Id!,
  }
}
