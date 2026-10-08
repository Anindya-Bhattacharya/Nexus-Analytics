-- =========================================================================
-- Supabase SQL Schema for Synapse / Nexus Analytics
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pzoxlahbiabzzqzooxns/sql/new
-- =========================================================================

-- 1. Create table for registered users
CREATE TABLE IF NOT EXISTS public.nexus_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'Registered Studio Specialist',
  avatar TEXT,
  phone TEXT,
  linkedin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'::jsonb
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.nexus_users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public / Anon & Authenticated Read Access
CREATE POLICY "Allow public read access"
ON public.nexus_users
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- 4. Policy: Public / Anon & Authenticated Insert Access (for Registration)
CREATE POLICY "Allow public insert access"
ON public.nexus_users
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- 5. Policy: Public / Anon & Authenticated Update Access (for Profile Updates)
CREATE POLICY "Allow public update access"
ON public.nexus_users
FOR UPDATE
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- 6. Policy: Delete Access
CREATE POLICY "Allow public delete access"
ON public.nexus_users
FOR DELETE
TO anon, authenticated, service_role
USING (true);

-- 7. High-performance indexes for username and email lookups
CREATE INDEX IF NOT EXISTS idx_nexus_users_username ON public.nexus_users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_nexus_users_email ON public.nexus_users (LOWER(email));
