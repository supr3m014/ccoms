/*
  # Create CMS Tables for Admin Panel

  ## Overview
  This migration creates all necessary tables for the CMS admin panel to manage website content.

  ## New Tables
  
  ### 1. blog_posts
  - `id` (uuid, primary key)
  - `title` (text)
  - `slug` (text, unique) - URL-friendly version of title
  - `excerpt` (text) - Short description
  - `content` (text) - Full blog post content (markdown)
  - `featured_image` (text) - URL to featured image
  - `author_id` (uuid) - References auth.users
  - `status` (text) - draft, published, archived
  - `published_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `meta_title` (text) - SEO title
  - `meta_description` (text) - SEO description

  ### 2. case_studies
  - `id` (uuid, primary key)
  - `title` (text)
  - `slug` (text, unique)
  - `client_name` (text)
  - `industry` (text)
  - `excerpt` (text)
  - `challenge` (text)
  - `solution` (text)
  - `results` (text)
  - `featured_image` (text)
  - `status` (text) - draft, published, archived
  - `published_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `meta_title` (text)
  - `meta_description` (text)

  ### 3. team_members
  - `id` (uuid, primary key)
  - `name` (text)
  - `role` (text)
  - `bio` (text)
  - `photo` (text) - URL to photo
  - `linkedin` (text)
  - `twitter` (text)
  - `display_order` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. site_settings
  - `id` (uuid, primary key)
  - `key` (text, unique) - Setting identifier
  - `value` (jsonb) - Setting value (flexible structure)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated admin users can manage content
  - Policies restrict access to authenticated users only
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  featured_image text,
  author_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  meta_title text,
  meta_description text
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Create case_studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  client_name text NOT NULL,
  industry text DEFAULT '',
  excerpt text DEFAULT '',
  challenge text DEFAULT '',
  solution text DEFAULT '',
  results text DEFAULT '',
  featured_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  meta_title text,
  meta_description text
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage case studies"
  ON case_studies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view published case studies"
  ON case_studies
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text DEFAULT '',
  photo text,
  linkedin text,
  twitter text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view team members"
  ON team_members
  FOR SELECT
  TO anon
  USING (true);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view site settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies(status);

CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_case_studies_updated_at ON case_studies;
CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings
INSERT INTO site_settings (key, value) 
VALUES 
  ('company_name', '{"value": "Core Conversion"}'),
  ('company_email', '{"value": "hello@coreconversion.com"}'),
  ('company_phone', '{"value": "+1 (555) 123-4567"}')
ON CONFLICT (key) DO NOTHING;
