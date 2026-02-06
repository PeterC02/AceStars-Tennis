import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Use service_role key for server-side API routes (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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
