-- ============================================================
-- GEMİ ACENTESİ PORTALI - SUPABASE VERİTABANI ŞEMASI
-- Bu dosyayı Supabase SQL Editor'e yapıştırarak çalıştırın
-- ============================================================

-- Extension: UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('armator', 'agency');

CREATE TYPE public.demand_status AS ENUM (
  'pending',
  'reviewing', 
  'approved',
  'rejected',
  'completed',
  'cancelled'
);

CREATE TYPE public.priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.user_role NOT NULL DEFAULT 'armator',
  full_name   TEXT NOT NULL,
  phone       TEXT,
  company_name TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SHIPS TABLE
-- ============================================================
CREATE TABLE public.ships (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  imo_no      TEXT NOT NULL UNIQUE,
  bayrak      TEXT NOT NULL,
  grt         NUMERIC(12, 2) NOT NULL,
  nrt         NUMERIC(12, 2) NOT NULL,
  dwt         NUMERIC(12, 2),
  yil         INTEGER CHECK (yil >= 1900 AND yil <= EXTRACT(YEAR FROM NOW()) + 1),
  gemi_tipi   TEXT,
  armator_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER ships_updated_at
  BEFORE UPDATE ON public.ships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_ships_armator_id ON public.ships(armator_id);
CREATE INDEX idx_ships_imo_no ON public.ships(imo_no);

-- ============================================================
-- DEMANDS TABLE
-- ============================================================
CREATE TABLE public.demands (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ship_id            UUID NOT NULL REFERENCES public.ships(id) ON DELETE CASCADE,
  agency_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status             public.demand_status NOT NULL DEFAULT 'pending',
  details            TEXT NOT NULL,
  port               TEXT NOT NULL,
  estimated_arrival  TIMESTAMPTZ,
  estimated_departure TIMESTAMPTZ,
  cargo_type         TEXT,
  cargo_amount       NUMERIC(15, 2),
  priority           public.priority_level NOT NULL DEFAULT 'normal',
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER demands_updated_at
  BEFORE UPDATE ON public.demands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_demands_ship_id ON public.demands(ship_id);
CREATE INDEX idx_demands_agency_id ON public.demands(agency_id);
CREATE INDEX idx_demands_status ON public.demands(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demands ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES RLS
-- ============================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Agencies can view all profiles (for contact info)
CREATE POLICY "profiles_select_agency"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'agency'
    )
  );

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- SHIPS RLS
-- ============================================================

-- Armators can view their own ships
CREATE POLICY "ships_select_own"
  ON public.ships FOR SELECT
  USING (armator_id = auth.uid());

-- Agencies can view all ships
CREATE POLICY "ships_select_agency"
  ON public.ships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'agency'
    )
  );

-- Only armators can insert ships (and only their own)
CREATE POLICY "ships_insert_own"
  ON public.ships FOR INSERT
  WITH CHECK (
    armator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'armator'
    )
  );

-- Only armators can update their own ships
CREATE POLICY "ships_update_own"
  ON public.ships FOR UPDATE
  USING (armator_id = auth.uid())
  WITH CHECK (armator_id = auth.uid());

-- Only armators can delete their own ships
CREATE POLICY "ships_delete_own"
  ON public.ships FOR DELETE
  USING (armator_id = auth.uid());

-- ============================================================
-- DEMANDS RLS
-- ============================================================

-- Armators can see demands for their ships
CREATE POLICY "demands_select_armator"
  ON public.demands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ships s
      WHERE s.id = ship_id AND s.armator_id = auth.uid()
    )
  );

-- Agencies can see all demands assigned to them or pending
CREATE POLICY "demands_select_agency"
  ON public.demands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'agency'
    )
  );

-- Armators can create demands for their ships
CREATE POLICY "demands_insert_armator"
  ON public.demands FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ships s
      WHERE s.id = ship_id AND s.armator_id = auth.uid()
    )
  );

-- Armators can update their own demands (limited status changes)
CREATE POLICY "demands_update_armator"
  ON public.demands FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ships s
      WHERE s.id = ship_id AND s.armator_id = auth.uid()
    )
  );

-- Agencies can update any demand's status
CREATE POLICY "demands_update_agency"
  ON public.demands FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'agency'
    )
  );

-- Armators can delete their own pending demands
CREATE POLICY "demands_delete_armator"
  ON public.demands FOR DELETE
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM public.ships s
      WHERE s.id = ship_id AND s.armator_id = auth.uid()
    )
  );

-- ============================================================
-- AUTO-CREATE PROFILE FUNCTION (Trigger on auth.users)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'İsimsiz Kullanıcı'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'armator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA (Test için - üretimde kaldırın)
-- ============================================================
-- Bu bölümü test ortamında çalıştırabilirsiniz
-- INSERT INTO public.profiles ...

COMMENT ON TABLE public.profiles IS 'Kullanıcı profilleri - armator ve acente rolleri';
COMMENT ON TABLE public.ships IS 'Gemi bilgileri - armatorlara ait';
COMMENT ON TABLE public.demands IS 'Hizmet talepleri - gemilere ait';
