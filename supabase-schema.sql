-- Supabase Database Schema for AceStars Bookings
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/phrcfxzohgygjibfsflp/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  
  quickbooks_customer_id TEXT,
  
  children JSONB DEFAULT '[]'::jsonb
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Venue & Programme
  venue TEXT NOT NULL,
  programme_id TEXT NOT NULL,
  programme_name TEXT NOT NULL,
  programme_category TEXT NOT NULL,
  
  -- Parent/Guardian
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  
  -- Children (JSON array: [{name, age, experience, medicalInfo}])
  children JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Camp specific (JSON array: [{week_id, week_name, days: []}])
  camp_days JSONB,
  
  -- Ludgrove session preferences (JSON: {preferred_slots, avoid_slots, preferred_days, avoid_days, notes})
  session_preferences JSONB,
  
  -- Pricing
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  
  -- Payment (invoice-only flow)
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'invoice',
  
  -- QuickBooks Invoice
  invoice_status TEXT DEFAULT 'not_sent',
  quickbooks_invoice_id TEXT,
  quickbooks_customer_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending',
  notes TEXT
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings(venue);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_parent_email ON bookings(parent_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for API routes)
DROP POLICY IF EXISTS "Service role has full access to bookings" ON bookings;
CREATE POLICY "Service role has full access to bookings"
  ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to customers" ON customers;
CREATE POLICY "Service role has full access to customers"
  ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);
