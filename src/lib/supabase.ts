import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
    }
    _supabase = createClient(supabaseUrl, supabaseKey)
  }
  return _supabase
}

export { getSupabase }

// Lazy proxy: calling `supabase.from(...)` etc. works as before but defers client creation to first use
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// Database types
export type Booking = {
  id: string
  created_at: string
  updated_at: string
  
  // Venue & Programme
  venue: 'Ludgrove' | 'Edgbarrow' | 'AceStars'
  programme_id: string
  programme_name: string
  programme_category: string
  
  // Parent/Guardian
  parent_name: string
  parent_email: string
  parent_phone: string
  
  // Children (JSON array)
  children: {
    name: string
    age: string
    experience: string
    medical_info: string
  }[]
  
  // Camp specific (JSON)
  camp_days?: {
    week_id?: string
    week_name?: string
    days: string[]
  }[]
  
  // Ludgrove session preferences (JSON)
  session_preferences?: {
    preferred_slots: string[]
    avoid_slots: string[]
    preferred_days: string[]
    avoid_days: string[]
    notes: string
  }
  
  // Pricing
  total_price: number
  currency: string
  
  // Payment
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: 'invoice' | 'manual'
  
  // Invoice
  invoice_status?: 'not_sent' | 'sent' | 'paid' | 'overdue'
  quickbooks_invoice_id?: string
  quickbooks_customer_id?: string
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
}

export type Customer = {
  id: string
  created_at: string
  email: string
  name: string
  phone: string
  quickbooks_customer_id?: string
  children: {
    name: string
    age: string
    medical_info: string
  }[]
}
