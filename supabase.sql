-- SOS Maullidos schema

-- Tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Tabla cats
CREATE TABLE IF NOT EXISTS public.cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age_text text,
  sex text,
  description text,
  status text DEFAULT 'en_adopcion',
  image_path text,
  published boolean DEFAULT false,
  sterilized boolean DEFAULT false,
  tested boolean DEFAULT false,
  location text,
  contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla posts (news/events/urgent/blog)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  image_path text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla inquiries (formularios públicos)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  amount numeric,
  message text NOT NULL,
  cat_id uuid,
  cat_name text,
  lang text DEFAULT 'es',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts (type);
CREATE INDEX IF NOT EXISTS idx_cats_status ON public.cats (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);

-- RLS: enable on tables
-- NOTE: After running this SQL, enable RLS in the Supabase UI for the tables.

-- Policies for public read (only published)
-- profiles: don't expose private data

-- Allow select on cats only if published = true
CREATE POLICY "Public select published cats" ON public.cats
  FOR SELECT USING (published = true);

-- Allow select on posts only if published = true
CREATE POLICY "Public select published posts" ON public.posts
  FOR SELECT USING (published = true);

-- Allow insert on inquiries from public forms
CREATE POLICY "Public insert inquiries" ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Admin policies: allow insert/update/delete for admins
-- Requires that `profiles` table maps auth user id to role 'admin'

CREATE POLICY "Admins manage cats" ON public.cats
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins manage posts" ON public.posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins manage inquiries" ON public.inquiries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- profiles: allow insert when auth.uid() = id (on signup) and admins can manage
CREATE POLICY "Insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid() AND p2.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid() AND p2.role = 'admin'
    )
  );

-- Storage: create a public bucket named 'public' via Supabase UI.
-- En la app se guardará solo la ruta (ej: "public/cats/abc.jpg").
