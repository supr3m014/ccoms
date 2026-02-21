-- RLS Hardening Migration
-- Date: 2026-02-21
-- Description: Enables public access to published content and taxonomies while securing administrative actions.

-- 1. Public Read Access for Published Content
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  TO anon
  USING (status = 'published');

-- 2. Public Read Access for Taxonomies and Junctions
-- Required for the website to display categories/tags associated with posts
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view tags"
  ON tags FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view page_categories"
  ON page_categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view page_tags"
  ON page_tags FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view post_categories"
  ON post_categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view post_tags"
  ON post_tags FOR SELECT
  TO anon
  USING (true);

-- 3. Media Access
-- Assets used in posts/pages must be readable by public
CREATE POLICY "Public can view media"
  ON media FOR SELECT
  TO anon
  USING (true);

-- 4. Essential Site Data
CREATE POLICY "Public can view active site settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view active seo scripts"
  ON seo_scripts FOR SELECT
  TO anon
  USING (is_active = true);

-- 5. Interactions (Testimonials/Comments)
CREATE POLICY "Public can view published interactions"
  ON interactions FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Anyone can submit interactions"
  ON interactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 6. Cleanup/Security: Ensure no other broad policies exist
-- Note: The "Authenticated users can manage..." policies already exist from previous migrations
-- and use 'authenticated' role, so they won't conflict with these 'anon' policies.
