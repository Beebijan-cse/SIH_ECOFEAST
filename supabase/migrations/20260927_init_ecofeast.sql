-- ==============================================================================
-- EcoFeast Database Schema & RLS Policies (PostgreSQL / Supabase)
-- "Save Food. Connect Communities. Create Impact."
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('kitchen', 'fpu', 'ngo', 'admin')),
  location TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Kitchens Table
CREATE TABLE IF NOT EXISTS kitchens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 28.6139,
  longitude DOUBLE PRECISION DEFAULT 77.2090,
  contact_person TEXT,
  daily_capacity NUMERIC DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FPUs (Food Processing Units) Table
CREATE TABLE IF NOT EXISTS fpus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_person TEXT,
  processing_capacity NUMERIC DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NGOs Table
CREATE TABLE IF NOT EXISTS ngos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_person TEXT,
  service_area TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 28.6200,
  longitude DOUBLE PRECISION DEFAULT 77.2150,
  daily_intake_capacity NUMERIC DEFAULT 400,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Surplus Listings Table
CREATE TABLE IF NOT EXISTS surplus_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  food_category TEXT NOT NULL CHECK (food_category IN ('Cooked Meals', 'Rice', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Packaged Food', 'Other')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  prepared_at TIMESTAMPTZ NOT NULL,
  expiry_time TIMESTAMPTZ NOT NULL,
  storage_type TEXT NOT NULL CHECK (storage_type IN ('Hot Hold (>60°C)', 'Cold Refrigerated (<4°C)', 'Ambient / Dry (15-25°C)', 'Frozen (<-18°C)')),
  safety_status TEXT NOT NULL DEFAULT 'pending' CHECK (safety_status IN ('pending', 'safe', 'unsafe', 'expired')),
  pickup_status TEXT NOT NULL DEFAULT 'available' CHECK (pickup_status IN ('available', 'matched', 'scheduled', 'picked_up', 'completed', 'cancelled')),
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Safety Checks Table
CREATE TABLE IF NOT EXISTS safety_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surplus_id UUID NOT NULL REFERENCES surplus_listings(id) ON DELETE CASCADE,
  checked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  temperature NUMERIC NOT NULL,
  appearance_status TEXT NOT NULL CHECK (appearance_status IN ('good', 'fair', 'poor')),
  packaging_status TEXT NOT NULL CHECK (packaging_status IN ('sealed', 'intact', 'compromised')),
  expiry_status TEXT NOT NULL CHECK (expiry_status IN ('valid', 'near_expiry', 'expired')),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('safe', 'unsafe', 'expired', 'pending')),
  notes TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surplus_id UUID NOT NULL REFERENCES surplus_listings(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  distance_km NUMERIC NOT NULL,
  match_score NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Pickups Table
CREATE TABLE IF NOT EXISTS pickups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  surplus_id UUID NOT NULL REFERENCES surplus_listings(id) ON DELETE CASCADE,
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  pickup_person TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Traceability Events Table
CREATE TABLE IF NOT EXISTS traceability_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surplus_id UUID NOT NULL REFERENCES surplus_listings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'safety_checked', 'matched', 'accepted', 'pickup_scheduled', 'picked_up', 'delivered', 'completed')),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  location TEXT,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Impact Metrics Table
CREATE TABLE IF NOT EXISTS impact_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('kitchen', 'fpu', 'ngo', 'global')),
  food_saved_kg NUMERIC DEFAULT 0,
  meals_supported INTEGER DEFAULT 0,
  people_reached INTEGER DEFAULT 0,
  co2_saved_kg NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('kitchen', 'fpu', 'ngo')),
  food_saved_kg NUMERIC DEFAULT 0,
  meals_supported INTEGER DEFAULT 0,
  co2_saved_kg NUMERIC DEFAULT 0,
  rank INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_surplus_kitchen ON surplus_listings(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_surplus_safety ON surplus_listings(safety_status);
CREATE INDEX IF NOT EXISTS idx_surplus_pickup ON surplus_listings(pickup_status);
CREATE INDEX IF NOT EXISTS idx_matches_surplus ON matches(surplus_id);
CREATE INDEX IF NOT EXISTS idx_matches_ngo ON matches(ngo_id);
CREATE INDEX IF NOT EXISTS idx_pickups_ngo ON pickups(ngo_id);
CREATE INDEX IF NOT EXISTS idx_traceability_surplus ON traceability_events(surplus_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchens ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE surplus_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE traceability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all registered profiles (for organization names), can update only their own
CREATE POLICY "Public profiles can be viewed by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Kitchens:
CREATE POLICY "Kitchens are readable by all authenticated users"
ON kitchens FOR SELECT TO authenticated USING (true);

CREATE POLICY "Kitchens can be managed by kitchen owners or admins"
ON kitchens FOR ALL TO authenticated USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Surplus Listings:
CREATE POLICY "Kitchens can insert surplus listings"
ON surplus_listings FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM kitchens WHERE kitchens.id = surplus_listings.kitchen_id AND kitchens.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Anyone can view safe or active surplus"
ON surplus_listings FOR SELECT TO authenticated USING (
  safety_status = 'safe' OR 
  EXISTS (SELECT 1 FROM kitchens WHERE kitchens.id = surplus_listings.kitchen_id AND kitchens.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Kitchen owners or admins can update their surplus"
ON surplus_listings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM kitchens WHERE kitchens.id = surplus_listings.kitchen_id AND kitchens.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Safety Checks:
CREATE POLICY "Safety checks can be viewed by all authenticated users"
ON safety_checks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Kitchen staff or inspectors can insert safety checks"
ON safety_checks FOR INSERT TO authenticated WITH CHECK (
  checked_by = auth.uid()
);

-- Matches:
CREATE POLICY "Matches visible to relevant parties and admin"
ON matches FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM ngos WHERE ngos.id = matches.ngo_id AND ngos.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM surplus_listings s JOIN kitchens k ON s.kitchen_id = k.id WHERE s.id = matches.surplus_id AND k.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Matches can be updated by assigned NGO, kitchen or admin"
ON matches FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM ngos WHERE ngos.id = matches.ngo_id AND ngos.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM surplus_listings s JOIN kitchens k ON s.kitchen_id = k.id WHERE s.id = matches.surplus_id AND k.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Pickups:
CREATE POLICY "Pickups readable by assigned NGO, kitchen, admin"
ON pickups FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM ngos WHERE ngos.id = pickups.ngo_id AND ngos.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM surplus_listings s JOIN kitchens k ON s.kitchen_id = k.id WHERE s.id = pickups.surplus_id AND k.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Pickups can be managed by NGO or admin"
ON pickups FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM ngos WHERE ngos.id = pickups.ngo_id AND ngos.profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Traceability:
CREATE POLICY "Traceability is public to authenticated users"
ON traceability_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Traceability events can be created by authenticated users"
ON traceability_events FOR INSERT TO authenticated WITH CHECK (true);

-- Impact & Leaderboard:
CREATE POLICY "Impact metrics are publicly viewable"
ON impact_metrics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leaderboard is publicly viewable"
ON leaderboard FOR SELECT TO authenticated USING (true);

-- Notifications:
CREATE POLICY "Users can view and update their own notifications"
ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());
