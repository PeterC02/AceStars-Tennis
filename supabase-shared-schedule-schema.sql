-- Shared Schedule Schema: coach preferences, constraints, upload tracking
-- Links admin page preferences to teacher-admin scheduling

-- Coach preferences (persisted from admin page)
CREATE TABLE IF NOT EXISTS coach_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  coach_id TEXT UNIQUE NOT NULL,       -- 'peter','wojtek','ollie','tom','andy','jake','james'
  coach_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#999',
  preferred_slots TEXT[] DEFAULT '{}',  -- ['breakfast','fruit']
  avoid_slots TEXT[] DEFAULT '{}',
  max_sessions_per_day INTEGER DEFAULT 3,
  preferred_days TEXT[] DEFAULT '{}',   -- ['mon','tue']
  avoid_days TEXT[] DEFAULT '{}'
);

-- Scheduling constraints (persisted from admin page)
CREATE TABLE IF NOT EXISTS schedule_constraints (
  id TEXT PRIMARY KEY,                  -- 'c1','c2', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  constraint_type TEXT NOT NULL,        -- 'max_coaches','reduce_slot','student_spread','coach_balance'
  description TEXT NOT NULL,
  value JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50
);

-- Teacher upload status tracking (per term)
CREATE TABLE IF NOT EXISTS teacher_upload_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  div_master_id UUID REFERENCES div_masters(id),
  term TEXT NOT NULL,
  boys_count INTEGER DEFAULT 0,
  blocked_slots_count INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT false,     -- teacher marks upload as complete
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(div_master_id, term)
);

-- Generated timetable metadata (tracks when/who generated)
CREATE TABLE IF NOT EXISTS timetable_generation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  term TEXT NOT NULL,
  generated_by TEXT NOT NULL,            -- 'admin' or teacher name
  total_lessons INTEGER DEFAULT 0,
  total_boys INTEGER DEFAULT 0,
  unscheduled_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,    -- visible to teachers/coaches
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teacher_upload_term ON teacher_upload_status(term);
CREATE INDEX IF NOT EXISTS idx_timetable_gen_term ON timetable_generation(term);

-- Triggers
DROP TRIGGER IF EXISTS update_coach_preferences_updated_at ON coach_preferences;
CREATE TRIGGER update_coach_preferences_updated_at
  BEFORE UPDATE ON coach_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_constraints_updated_at ON schedule_constraints;
CREATE TRIGGER update_schedule_constraints_updated_at
  BEFORE UPDATE ON schedule_constraints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teacher_upload_status_updated_at ON teacher_upload_status;
CREATE TRIGGER update_teacher_upload_status_updated_at
  BEFORE UPDATE ON teacher_upload_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE coach_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_upload_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_generation ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role full access coach_preferences" ON coach_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access schedule_constraints" ON schedule_constraints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access teacher_upload_status" ON teacher_upload_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access timetable_generation" ON timetable_generation FOR ALL USING (true) WITH CHECK (true);

-- Seed default coach preferences
INSERT INTO coach_preferences (coach_id, coach_name, color, preferred_slots) VALUES
  ('peter', 'Peter', '#F87D4D', ARRAY['breakfast']),
  ('wojtek', 'Wojtek', '#65B863', ARRAY[]::TEXT[]),
  ('ollie', 'Ollie', '#dfd300', ARRAY[]::TEXT[]),
  ('tom', 'Tom', '#3B82F6', ARRAY[]::TEXT[]),
  ('andy', 'Andy', '#8B5CF6', ARRAY['fruit']),
  ('jake', 'Jake', '#EC4899', ARRAY[]::TEXT[]),
  ('james', 'James', '#14B8A6', ARRAY[]::TEXT[])
ON CONFLICT (coach_id) DO NOTHING;

-- Seed default constraints
INSERT INTO schedule_constraints (id, constraint_type, description, value, enabled, priority) VALUES
  ('c1', 'max_coaches', 'Maximum 6 coaches coaching at any one time', '{"maxCoaches": 6}', true, 100),
  ('c2', 'reduce_slot', 'Reduce Monday breakfast (boys return late every other week)', '{"day": "mon", "slot": "breakfast", "reduction": 50}', true, 90),
  ('c3', 'reduce_slot', 'Reduce Wednesday rest (sport day)', '{"day": "wed", "slot": "rest", "reduction": 75}', true, 90),
  ('c4', 'reduce_slot', 'Reduce Friday fruit (boys leave early)', '{"day": "fri", "slot": "fruit", "reduction": 75}', true, 90),
  ('c5', 'reduce_slot', 'No Friday rest lessons (boys leave early)', '{"day": "fri", "slot": "rest", "reduction": 100}', true, 100),
  ('c6', 'student_spread', 'Spread student lessons across different days', '{"minDaysBetween": 1}', true, 70),
  ('c7', 'coach_balance', 'Balance lessons evenly across coaches per day', '{"maxVariance": 1}', true, 60)
ON CONFLICT (id) DO NOTHING;
