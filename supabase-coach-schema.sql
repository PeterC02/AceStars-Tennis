-- Coach Accounts Schema for AceStars Tennis
-- Run this in your Supabase SQL Editor

-- Coaches table (similar to div_masters but for coach accounts)
CREATE TABLE IF NOT EXISTS coaches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,  -- Simple 4-6 digit PIN for login
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Profile info
  title TEXT,              -- e.g. 'Head Coach', 'Assistant Coach'
  qualifications TEXT,     -- e.g. 'LTA Level 3'
  bio TEXT
);

-- Coach invoices table
CREATE TABLE IF NOT EXISTS coach_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  
  -- Invoice details
  invoice_month TEXT NOT NULL,       -- e.g. 'January 2026'
  invoice_year INTEGER NOT NULL,     -- e.g. 2026
  file_name TEXT NOT NULL,           -- Original filename
  file_url TEXT,                     -- Storage URL (if using Supabase storage)
  file_data TEXT,                    -- Base64 encoded file data (for small files)
  
  -- Status tracking
  status TEXT DEFAULT 'submitted',   -- 'submitted', 'approved', 'corrections_needed', 'paid'
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin feedback
  admin_comment TEXT,
  
  -- Amount (optional - admin can fill in)
  amount DECIMAL(10, 2),
  
  -- Retention policy: auto-delete after 1 year
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year')
);

-- Verification codes for coaches (similar to div_masters)
CREATE TABLE IF NOT EXISTS coach_verification_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  coach_data JSONB,
  action TEXT NOT NULL,  -- 'login' or 'register'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coaching rules/documents table
CREATE TABLE IF NOT EXISTS coaching_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_data TEXT,          -- Base64 for small files
  category TEXT DEFAULT 'rules',  -- 'rules', 'policy', 'guide'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- School financial data table (for the 4 schools)
CREATE TABLE IF NOT EXISTS school_financials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  school_name TEXT NOT NULL,  -- 'Yateley Manor', 'Edgbarrow', 'Nine Mile Ride', 'Ludgrove'
  academic_year TEXT NOT NULL, -- e.g. '2025-2026'
  term TEXT NOT NULL,          -- 'Autumn', 'Spring', 'Summer'
  
  -- Term dates
  term_start_date DATE,
  term_end_date DATE,
  half_term_start DATE,
  half_term_end DATE,
  
  -- Revenue streams
  programme_type TEXT NOT NULL,  -- e.g. '1-2-1', 'Group', 'AfterSchool', 'Performance'
  price_per_session DECIMAL(10, 2),
  sessions_per_week INTEGER DEFAULT 1,
  weeks_in_term INTEGER,
  students_enrolled INTEGER DEFAULT 0,
  
  -- Calculated fields (stored for performance)
  total_revenue DECIMAL(10, 2) GENERATED ALWAYS AS (
    COALESCE(price_per_session, 0) * COALESCE(sessions_per_week, 1) * COALESCE(weeks_in_term, 0) * COALESCE(students_enrolled, 0)
  ) STORED,
  
  notes TEXT,
  
  UNIQUE(school_name, academic_year, term, programme_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coaches_email ON coaches(email);
CREATE INDEX IF NOT EXISTS idx_coach_invoices_coach ON coach_invoices(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_invoices_status ON coach_invoices(status);
CREATE INDEX IF NOT EXISTS idx_coach_invoices_expires ON coach_invoices(expires_at);
CREATE INDEX IF NOT EXISTS idx_school_financials_school ON school_financials(school_name);
CREATE INDEX IF NOT EXISTS idx_school_financials_year ON school_financials(academic_year);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coaches_updated_at ON coaches;
CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON coaches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_invoices_updated_at ON coach_invoices;
CREATE TRIGGER update_coach_invoices_updated_at
  BEFORE UPDATE ON coach_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coaching_documents_updated_at ON coaching_documents;
CREATE TRIGGER update_coaching_documents_updated_at
  BEFORE UPDATE ON coaching_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_school_financials_updated_at ON school_financials;
CREATE TRIGGER update_school_financials_updated_at
  BEFORE UPDATE ON school_financials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_financials ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
DROP POLICY IF EXISTS "Service role has full access to coaches" ON coaches;
CREATE POLICY "Service role has full access to coaches"
  ON coaches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to coach_invoices" ON coach_invoices;
CREATE POLICY "Service role has full access to coach_invoices"
  ON coach_invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to coach_verification_codes" ON coach_verification_codes;
CREATE POLICY "Service role has full access to coach_verification_codes"
  ON coach_verification_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to coaching_documents" ON coaching_documents;
CREATE POLICY "Service role has full access to coaching_documents"
  ON coaching_documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to school_financials" ON school_financials;
CREATE POLICY "Service role has full access to school_financials"
  ON school_financials FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup expired invoices (run as a cron job or scheduled function)
-- DELETE FROM coach_invoices WHERE expires_at < NOW();
