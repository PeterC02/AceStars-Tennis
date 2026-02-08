-- Teacher/Div Master Schema for Ludgrove Tennis Scheduling
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/phrcfxzohgygjibfsflp/sql

-- Div Masters / Teachers table
CREATE TABLE IF NOT EXISTS div_masters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,  -- Simple 4-6 digit PIN for login
  division TEXT,           -- e.g. 'Division A', 'Year 5'
  is_active BOOLEAN DEFAULT true
);

-- Boys (students at Ludgrove)
CREATE TABLE IF NOT EXISTS boys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  year_group TEXT,           -- e.g. 'Year 5', 'Year 6'
  division TEXT,             -- e.g. 'Division A'
  div_master_id UUID REFERENCES div_masters(id),
  coach_preference TEXT,     -- preferred coach id
  lessons_per_week INTEGER DEFAULT 2,
  notes TEXT
);

-- School timetable uploads - stores which slots a boy is BLOCKED
-- (has a school lesson during breakfast/fruit/rest)
CREATE TABLE IF NOT EXISTS boy_blocked_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  boy_id UUID REFERENCES boys(id) ON DELETE CASCADE,
  day TEXT NOT NULL,          -- 'mon','tue','wed','thu','fri'
  slot TEXT NOT NULL,         -- 'breakfast','fruit','rest'
  school_lesson TEXT,         -- what lesson blocks this slot e.g. 'Maths', 'English'
  term TEXT,                  -- e.g. 'Summer 2026'
  uploaded_by UUID REFERENCES div_masters(id),
  
  UNIQUE(boy_id, day, slot, term)
);

-- Generated tennis schedule entries
CREATE TABLE IF NOT EXISTS tennis_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  boy_id UUID REFERENCES boys(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL,     -- matches coach id from admin page
  day TEXT NOT NULL,           -- 'mon','tue','wed','thu','fri'
  slot TEXT NOT NULL,          -- 'breakfast','fruit','rest'
  term TEXT NOT NULL,          -- e.g. 'Summer 2026'
  is_locked BOOLEAN DEFAULT false,
  
  UNIQUE(boy_id, day, slot, term)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_boys_div_master ON boys(div_master_id);
CREATE INDEX IF NOT EXISTS idx_boys_division ON boys(division);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_boy ON boy_blocked_slots(boy_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_term ON boy_blocked_slots(term);
CREATE INDEX IF NOT EXISTS idx_tennis_schedule_term ON tennis_schedule(term);
CREATE INDEX IF NOT EXISTS idx_tennis_schedule_boy ON tennis_schedule(boy_id);

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_div_masters_updated_at ON div_masters;
CREATE TRIGGER update_div_masters_updated_at
  BEFORE UPDATE ON div_masters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boys_updated_at ON boys;
CREATE TRIGGER update_boys_updated_at
  BEFORE UPDATE ON boys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tennis_schedule_updated_at ON tennis_schedule;
CREATE TRIGGER update_tennis_schedule_updated_at
  BEFORE UPDATE ON tennis_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE div_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE boys ENABLE ROW LEVEL SECURITY;
ALTER TABLE boy_blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tennis_schedule ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
DROP POLICY IF EXISTS "Service role has full access to div_masters" ON div_masters;
CREATE POLICY "Service role has full access to div_masters"
  ON div_masters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to boys" ON boys;
CREATE POLICY "Service role has full access to boys"
  ON boys FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to boy_blocked_slots" ON boy_blocked_slots;
CREATE POLICY "Service role has full access to boy_blocked_slots"
  ON boy_blocked_slots FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to tennis_schedule" ON tennis_schedule;
CREATE POLICY "Service role has full access to tennis_schedule"
  ON tennis_schedule FOR ALL USING (true) WITH CHECK (true);
