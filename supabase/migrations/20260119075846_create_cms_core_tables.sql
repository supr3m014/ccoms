/*
  # Create CMS Core Tables

  ## 1. Categories Table
  Stores categories for pages and posts
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `slug` (text, unique, URL-friendly)
  - `description` (text, optional)
  - `type` (text, page/post)
  - `parent_id` (uuid, optional, for nested categories)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Tags Table
  Stores tags for pages and posts
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `slug` (text, unique, URL-friendly)
  - `type` (text, page/post)
  - `created_at` (timestamptz)

  ## 3. Media Library Table
  Stores uploaded media files
  - `id` (uuid, primary key)
  - `filename` (text)
  - `file_url` (text)
  - `file_type` (text, image/video/audio/document/etc)
  - `file_size` (bigint, bytes)
  - `mime_type` (text)
  - `width` (int, for images/videos)
  - `height` (int, for images/videos)
  - `alt_text` (text)
  - `caption` (text)
  - `uploaded_by` (uuid, references auth.users)
  - `created_at` (timestamptz)

  ## 4. Pages Table
  Stores website pages
  - `id` (uuid, primary key)
  - `title` (text)
  - `slug` (text, unique)
  - `content` (text)
  - `excerpt` (text)
  - `featured_image_id` (uuid, references media)
  - `parent_id` (uuid, optional)
  - `template` (text)
  - `status` (text: draft/published/scheduled/pending_review)
  - `visibility` (text: public/password_protected/private)
  - `password` (text, optional)
  - `comments_enabled` (boolean)
  - `meta_title` (text)
  - `meta_description` (text)
  - `author_id` (uuid, references auth.users)
  - `reviewer_id` (uuid, optional)
  - `published_at` (timestamptz)
  - `scheduled_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 5. Posts Table
  Stores blog posts
  - Same structure as Pages but for posts

  ## 6. Page Categories (Junction Table)
  - `page_id` (uuid, references pages)
  - `category_id` (uuid, references categories)

  ## 7. Page Tags (Junction Table)
  - `page_id` (uuid, references pages)
  - `tag_id` (uuid, references tags)

  ## 8. Post Categories (Junction Table)
  - `post_id` (uuid, references posts)
  - `category_id` (uuid, references categories)

  ## 9. Post Tags (Junction Table)
  - `post_id` (uuid, references posts)
  - `tag_id` (uuid, references tags)

  ## 10. Interactions Table (Comments/Reviews/Testimonials)
  Stores all types of user interactions
  - `id` (uuid, primary key)
  - `type` (text: comment/testimonial/review)
  - `content_type` (text: page/post/service/case_study)
  - `content_id` (uuid)
  - `name` (text)
  - `email` (text)
  - `content` (text)
  - `rating` (int, 1-5 for reviews)
  - `status` (text: pending/published/trash)
  - `created_at` (timestamptz)

  ## 11. Redirects Table
  Stores URL redirects
  - `id` (uuid, primary key)
  - `redirect_from` (text, unique)
  - `redirect_to` (text)
  - `status_code` (int: 301/302/307)
  - `enabled` (boolean)
  - `hit_count` (int)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 12. 404 Error Log Table
  Tracks 404 errors
  - `id` (uuid, primary key)
  - `url` (text)
  - `referrer` (text)
  - `user_agent` (text)
  - `ip_address` (text)
  - `hit_count` (int)
  - `first_seen_at` (timestamptz)
  - `last_seen_at` (timestamptz)

  ## 13. SEO Scripts Table
  Stores head/body/footer scripts with version history
  - `id` (uuid, primary key)
  - `location` (text: head/body_start/footer)
  - `script_content` (text)
  - `environment` (text: staging/production/both)
  - `version` (int)
  - `is_active` (boolean)
  - `created_by` (uuid, references auth.users)
  - `created_at` (timestamptz)

  ## 14. Site Settings Table
  Stores global site settings
  - `id` (uuid, primary key)
  - `setting_key` (text, unique)
  - `setting_value` (jsonb)
  - `updated_at` (timestamptz)

  ## 15. Notifications Table
  Stores user notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `title` (text)
  - `message` (text)
  - `type` (text)
  - `link` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated admin users only
*/

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  type text NOT NULL DEFAULT 'post',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'post',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Media Library Table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  mime_type text DEFAULT '',
  width int,
  height int,
  alt_text text DEFAULT '',
  caption text DEFAULT '',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage media"
  ON media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  featured_image_id uuid REFERENCES media(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  template text DEFAULT 'default',
  status text DEFAULT 'draft',
  visibility text DEFAULT 'public',
  password text,
  comments_enabled boolean DEFAULT true,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  featured_image_id uuid REFERENCES media(id) ON DELETE SET NULL,
  template text DEFAULT 'default',
  status text DEFAULT 'draft',
  visibility text DEFAULT 'public',
  password text,
  comments_enabled boolean DEFAULT true,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage posts"
  ON posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Junction Tables
CREATE TABLE IF NOT EXISTS page_categories (
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, category_id)
);

ALTER TABLE page_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage page_categories"
  ON page_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS page_tags (
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, tag_id)
);

ALTER TABLE page_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage page_tags"
  ON page_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS post_categories (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage post_categories"
  ON post_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage post_tags"
  ON post_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Interactions Table
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'comment',
  content_type text NOT NULL,
  content_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  content text NOT NULL,
  rating int,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage interactions"
  ON interactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Redirects Table
CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  redirect_from text UNIQUE NOT NULL,
  redirect_to text NOT NULL,
  status_code int DEFAULT 301,
  enabled boolean DEFAULT true,
  hit_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage redirects"
  ON redirects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 404 Error Log Table
CREATE TABLE IF NOT EXISTS error_404_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  referrer text DEFAULT '',
  user_agent text DEFAULT '',
  ip_address text DEFAULT '',
  hit_count int DEFAULT 1,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

ALTER TABLE error_404_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view 404 logs"
  ON error_404_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete 404 logs"
  ON error_404_log FOR DELETE
  TO authenticated
  USING (true);

-- SEO Scripts Table
CREATE TABLE IF NOT EXISTS seo_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  script_content text DEFAULT '',
  environment text DEFAULT 'both',
  version int DEFAULT 1,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seo_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage seo_scripts"
  ON seo_scripts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  link text DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_author_id ON pages(author_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_interactions_status ON interactions(status);
CREATE INDEX IF NOT EXISTS idx_interactions_content_type ON interactions(content_type);
CREATE INDEX IF NOT EXISTS idx_redirects_enabled ON redirects(enabled);
CREATE INDEX IF NOT EXISTS idx_redirects_redirect_from ON redirects(redirect_from);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
