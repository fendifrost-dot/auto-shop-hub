-- Boltz Automotive / Auto Shop Hub — V1 core schema, RLS, and role helpers
-- Apply with: supabase db push (or SQL editor)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'mechanic');

CREATE TYPE public.time_entry_status AS ENUM ('active', 'completed', 'edited');

CREATE TYPE public.idle_category AS ENUM (
  'cleanup',
  'meeting',
  'waiting_parts',
  'training',
  'break',
  'other'
);

CREATE TYPE public.job_status AS ENUM ('pending', 'in_progress', 'completed', 'invoiced');

CREATE TYPE public.revenue_period_type AS ENUM ('daily', 'weekly', 'monthly');

CREATE TYPE public.performance_record_type AS ENUM ('review', 'incident', 'commendation', 'warning');

CREATE TYPE public.performance_status AS ENUM ('pending', 'reviewed', 'closed');

CREATE TYPE public.bonus_period_status AS ENUM ('open', 'calculated', 'approved', 'paid');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  role_title text,
  phone text,
  email text,
  avatar_url text,
  hire_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number text NOT NULL UNIQUE,
  customer_name text,
  vehicle_info text,
  description text,
  status public.job_status NOT NULL DEFAULT 'pending',
  assigned_to uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  estimated_hours numeric,
  actual_hours numeric,
  revenue numeric,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  total_hours numeric,
  status public.time_entry_status NOT NULL DEFAULT 'active',
  edited_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  edit_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.job_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid NOT NULL REFERENCES public.time_entries (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs (id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  is_idle boolean NOT NULL DEFAULT false,
  idle_category public.idle_category,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.revenue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type public.revenue_period_type NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  revenue_amount numeric NOT NULL,
  goal_amount numeric NOT NULL,
  margin_percent numeric,
  entered_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.performance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recorded_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type public.performance_record_type NOT NULL,
  summary text NOT NULL,
  details text,
  status public.performance_status NOT NULL DEFAULT 'pending',
  date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bonus_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE,
  pool_amount numeric NOT NULL DEFAULT 2000,
  status public.bonus_period_status NOT NULL DEFAULT 'open',
  approved_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bonus_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_period_id uuid NOT NULL REFERENCES public.bonus_periods (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  rank integer NOT NULL,
  revenue_score numeric,
  efficiency_score numeric,
  quality_score numeric,
  weighted_total numeric,
  payout_amount numeric,
  is_eligible boolean NOT NULL DEFAULT true,
  disqualification_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bonus_period_id, user_id),
  UNIQUE (bonus_period_id, rank)
);

CREATE TABLE public.time_edit_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid NOT NULL REFERENCES public.time_entries (id) ON DELETE CASCADE,
  edited_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  edit_type text NOT NULL,
  old_value text,
  new_value text,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_time_entries_user_clock ON public.time_entries (user_id, clock_in DESC);
CREATE INDEX idx_job_time_entries_time_entry ON public.job_time_entries (time_entry_id);
CREATE INDEX idx_jobs_assigned ON public.jobs (assigned_to);
CREATE INDEX idx_performance_user ON public.performance_records (user_id, date DESC);
CREATE INDEX idx_revenue_period ON public.revenue_entries (period_start, period_end);

-- ---------------------------------------------------------------------------
-- Triggers: updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER job_time_entries_updated_at BEFORE UPDATE ON public.job_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER performance_records_updated_at BEFORE UPDATE ON public.performance_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Time entry: compute total_hours when clock_out set
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.time_entries_compute_hours()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
    NEW.total_hours := round(
      (EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0)::numeric,
      2
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER time_entries_compute_hours_trg
  BEFORE INSERT OR UPDATE OF clock_in, clock_out ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.time_entries_compute_hours();

-- ---------------------------------------------------------------------------
-- Auth: create profile row when a user signs up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helper (avoids recursive RLS)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_shop_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id);
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_shop_role(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_edit_audit_log ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own_or_staff"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- user_roles — readable by staff; writes admin-only
CREATE POLICY "user_roles_select_staff"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "user_roles_admin_all"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- jobs
CREATE POLICY "jobs_select_scope"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR (
      public.has_role(auth.uid(), 'mechanic')
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "jobs_insert_staff"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "jobs_update_staff"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "jobs_delete_admin"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- time_entries
CREATE POLICY "time_entries_select_scope"
  ON public.time_entries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "time_entries_insert_own"
  ON public.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'mechanic')
      OR public.has_role(auth.uid(), 'manager')
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "time_entries_update_managers_only"
  ON public.time_entries FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

-- job_time_entries
CREATE POLICY "job_time_entries_select_scope"
  ON public.job_time_entries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "job_time_entries_insert_own"
  ON public.job_time_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "job_time_entries_update_own"
  ON public.job_time_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- revenue_entries — managers/admins
CREATE POLICY "revenue_entries_select_managers"
  ON public.revenue_entries FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "revenue_entries_write_managers"
  ON public.revenue_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "revenue_entries_update_managers"
  ON public.revenue_entries FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

-- performance_records
CREATE POLICY "performance_select_scope"
  ON public.performance_records FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "performance_insert_managers"
  ON public.performance_records FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "performance_update_managers"
  ON public.performance_records FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

-- bonus_periods / bonus_rankings
CREATE POLICY "bonus_periods_select_authenticated"
  ON public.bonus_periods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "bonus_periods_write_admin"
  ON public.bonus_periods FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "bonus_rankings_select_scope"
  ON public.bonus_rankings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "bonus_rankings_write_admin"
  ON public.bonus_rankings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- time_edit_audit_log
CREATE POLICY "audit_select_admin_manager"
  ON public.time_edit_audit_log FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "audit_insert_managers"
  ON public.time_edit_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );
