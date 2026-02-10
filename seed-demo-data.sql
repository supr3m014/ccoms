-- Seed demo data for CMS

-- Insert demo categories for posts
INSERT INTO categories (name, slug, description, type) VALUES
  ('SEO', 'seo', 'Search Engine Optimization articles', 'post'),
  ('Web Development', 'web-development', 'Website development tutorials', 'post'),
  ('Digital Marketing', 'digital-marketing', 'Marketing strategies and tips', 'post'),
  ('Case Studies', 'case-studies', 'Client success stories', 'post')
ON CONFLICT DO NOTHING;

-- Insert demo categories for pages
INSERT INTO categories (name, slug, description, type) VALUES
  ('Services', 'services', 'Service pages', 'page'),
  ('About', 'about', 'About pages', 'page')
ON CONFLICT DO NOTHING;

-- Insert demo tags for posts
INSERT INTO tags (name, slug, type) VALUES
  ('Tutorial', 'tutorial', 'post'),
  ('Guide', 'guide', 'post'),
  ('Tips', 'tips', 'post'),
  ('Best Practices', 'best-practices', 'post'),
  ('Trends', 'trends', 'post')
ON CONFLICT DO NOTHING;

-- Insert demo tags for pages
INSERT INTO tags (name, slug, type) VALUES
  ('Featured', 'featured', 'page'),
  ('Popular', 'popular', 'page')
ON CONFLICT DO NOTHING;

-- Insert demo posts (using first user as author)
INSERT INTO posts (title, slug, content, excerpt, status, visibility, comments_enabled, meta_title, meta_description, author_id, published_at)
SELECT
  'Getting Started with SEO in 2024',
  'getting-started-with-seo-2024',
  E'# Getting Started with SEO in 2024\n\nSearch Engine Optimization continues to evolve. In this comprehensive guide, we''ll walk through the essential steps to optimize your website for search engines in 2024.\n\n## Understanding SEO Fundamentals\n\nSEO is the practice of optimizing your website to rank higher in search engine results pages (SERPs). Here are the key components:\n\n1. **On-Page SEO**: Optimizing individual pages\n2. **Off-Page SEO**: Building authority through backlinks\n3. **Technical SEO**: Ensuring your site is crawlable and fast\n\n## Best Practices\n\n- Create high-quality, valuable content\n- Optimize for user intent\n- Improve page speed\n- Build quality backlinks\n- Use proper heading structure\n\n## Conclusion\n\nSEO is a long-term investment that requires patience and consistent effort. Start with these fundamentals and build from there.',
  'Learn the essential steps to optimize your website for search engines in 2024. A comprehensive beginner-friendly guide.',
  'published',
  'public',
  true,
  'Getting Started with SEO in 2024 | Complete Guide',
  'Master SEO fundamentals with our comprehensive guide. Learn on-page, off-page, and technical SEO best practices.',
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO posts (title, slug, content, excerpt, status, visibility, comments_enabled, meta_title, meta_description, author_id, published_at)
SELECT
  '10 Web Development Trends for Modern Websites',
  '10-web-development-trends-modern-websites',
  E'# 10 Web Development Trends for Modern Websites\n\nThe web development landscape is constantly evolving. Here are the top trends shaping modern web development:\n\n## 1. Progressive Web Apps (PWAs)\nPWAs combine the best of web and mobile apps, offering offline functionality and push notifications.\n\n## 2. AI Integration\nArtificial intelligence is being integrated into websites for chatbots, personalization, and content generation.\n\n## 3. Serverless Architecture\nServerless computing allows developers to build applications without managing infrastructure.\n\n## 4. Motion UI\nAnimations and transitions create engaging user experiences.\n\n## 5. Voice Search Optimization\nOptimizing for voice search is becoming essential as smart speakers gain popularity.\n\n## 6. Dark Mode\nDark mode interfaces reduce eye strain and save battery life.\n\n## 7. Micro-Frontends\nBreaking down large applications into smaller, manageable pieces.\n\n## 8. WebAssembly\nEnabling high-performance applications in the browser.\n\n## 9. Jamstack\nJavaScript, APIs, and Markup for faster, more secure websites.\n\n## 10. Accessibility First\nBuilding inclusive web experiences for all users.',
  'Discover the latest web development trends transforming how we build modern websites and web applications.',
  'published',
  'public',
  true,
  '10 Web Development Trends for Modern Websites | 2024',
  'Stay ahead with the latest web development trends. From PWAs to AI integration, learn what''s shaping modern web development.',
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO posts (title, slug, content, excerpt, status, visibility, comments_enabled, meta_title, meta_description, author_id)
SELECT
  'How We Increased Organic Traffic by 300%',
  'how-we-increased-organic-traffic-300-percent',
  E'# How We Increased Organic Traffic by 300%\n\nIn this case study, we''ll share how we helped a client triple their organic search traffic in just 6 months.\n\n## The Challenge\n\nOur client was struggling with low search visibility and minimal organic traffic despite having quality products.\n\n## Our Approach\n\n### 1. Comprehensive SEO Audit\nWe identified technical issues, content gaps, and opportunities for improvement.\n\n### 2. Content Strategy\nCreated a content calendar targeting high-value keywords with buyer intent.\n\n### 3. Technical Optimization\n- Improved site speed by 40%\n- Fixed crawl errors\n- Implemented structured data\n- Optimized for Core Web Vitals\n\n### 4. Link Building\nSecured high-quality backlinks from industry-relevant websites.\n\n## The Results\n\n- 300% increase in organic traffic\n- 150% increase in keyword rankings\n- 200% increase in organic revenue\n- Reduced bounce rate by 25%\n\n## Key Takeaways\n\nSuccess in SEO requires a holistic approach combining technical optimization, quality content, and authoritative backlinks.',
  'A detailed case study showing how we tripled organic search traffic through strategic SEO optimization.',
  'draft',
  'public',
  true,
  'Case Study: 300% Organic Traffic Increase | SEO Success',
  'Learn how we helped a client triple organic traffic in 6 months through comprehensive SEO strategies.',
  (SELECT id FROM auth.users LIMIT 1),
  NULL
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Insert demo pages
INSERT INTO pages (title, slug, content, status, visibility, meta_title, meta_description, author_id, published_at)
SELECT
  'Privacy Policy',
  'privacy-policy',
  E'# Privacy Policy\n\nLast updated: January 2024\n\n## Information We Collect\n\nWe collect information you provide directly to us, including:\n\n- Name and contact information\n- Account credentials\n- Payment information\n- Communications with us\n\n## How We Use Your Information\n\nWe use the information we collect to:\n\n- Provide and improve our services\n- Process transactions\n- Send administrative information\n- Respond to your requests\n- Protect against fraud\n\n## Information Sharing\n\nWe do not sell your personal information. We may share your information with:\n\n- Service providers\n- Legal authorities when required\n- Business partners with your consent\n\n## Your Rights\n\nYou have the right to:\n\n- Access your personal information\n- Correct inaccurate data\n- Request deletion of your data\n- Opt-out of marketing communications\n\n## Contact Us\n\nIf you have questions about this Privacy Policy, please contact us.',
  'published',
  'public',
  'Privacy Policy | Core Conversion',
  'Learn how we collect, use, and protect your personal information.',
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '30 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO pages (title, slug, content, status, visibility, meta_title, meta_description, author_id, published_at)
SELECT
  'Terms of Service',
  'terms-of-service',
  E'# Terms of Service\n\nLast updated: January 2024\n\n## Acceptance of Terms\n\nBy accessing or using our services, you agree to be bound by these Terms of Service.\n\n## Use of Services\n\nYou agree to:\n\n- Use our services lawfully\n- Not interfere with service operation\n- Not attempt unauthorized access\n- Respect intellectual property rights\n\n## User Accounts\n\nYou are responsible for:\n\n- Maintaining account security\n- All activities under your account\n- Notifying us of unauthorized use\n\n## Intellectual Property\n\nAll content and materials are protected by copyright and other intellectual property laws.\n\n## Limitation of Liability\n\nOur services are provided "as is" without warranties of any kind.\n\n## Termination\n\nWe may terminate or suspend access to our services immediately, without prior notice, for any breach of these Terms.\n\n## Changes to Terms\n\nWe reserve the right to modify these terms at any time.\n\n## Contact\n\nFor questions about these Terms, please contact us.',
  'published',
  'public',
  'Terms of Service | Core Conversion',
  'Read our terms of service governing the use of our website and services.',
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '30 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Insert demo interactions (comments)
INSERT INTO interactions (type, post_id, author_name, author_email, content, status, user_agent)
SELECT
  'comment',
  (SELECT id FROM posts WHERE slug = 'getting-started-with-seo-2024' LIMIT 1),
  'John Doe',
  'john@example.com',
  'Great article! Really helped me understand SEO fundamentals. Looking forward to more content like this.',
  'approved',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
WHERE EXISTS (SELECT 1 FROM posts WHERE slug = 'getting-started-with-seo-2024' LIMIT 1);

INSERT INTO interactions (type, post_id, author_name, author_email, content, status, user_agent)
SELECT
  'comment',
  (SELECT id FROM posts WHERE slug = '10-web-development-trends-modern-websites' LIMIT 1),
  'Jane Smith',
  'jane@example.com',
  'PWAs are definitely the future! We just launched one for our company and the results have been amazing.',
  'approved',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
WHERE EXISTS (SELECT 1 FROM posts WHERE slug = '10-web-development-trends-modern-websites' LIMIT 1);

INSERT INTO interactions (type, post_id, author_name, author_email, content, status, user_agent)
SELECT
  'comment',
  (SELECT id FROM posts WHERE slug = '10-web-development-trends-modern-websites' LIMIT 1),
  'Spam Bot',
  'spam@spam.com',
  'Check out my website for amazing deals!!!',
  'pending',
  'SpamBot/1.0'
WHERE EXISTS (SELECT 1 FROM posts WHERE slug = '10-web-development-trends-modern-websites' LIMIT 1);

-- Insert demo SEO scripts
INSERT INTO seo_scripts (name, script_type, position, content, is_active, pages)
VALUES
  ('Google Analytics', 'analytics', 'head', '<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>', true, 'all'),
  ('Facebook Pixel', 'analytics', 'head', '<script>!function(f,b,e,v,n,t,s){...}</script>', true, 'all'),
  ('Hotjar Tracking', 'analytics', 'body', '<script>(function(h,o,t,j,a,r){...})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");</script>', false, 'all');

-- Insert demo redirects
INSERT INTO redirects (source_path, destination_path, redirect_type, is_active)
VALUES
  ('/old-blog', '/blog', 301, true),
  ('/services/seo-services', '/services/seo', 301, true),
  ('/contact-us', '/contact', 302, true);

-- Insert demo site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, is_public)
VALUES
  ('site_name', 'Core Conversion', 'text', true),
  ('site_description', 'Founder-led SEO, development, and creative services', 'text', true),
  ('posts_per_page', '10', 'number', true),
  ('comments_enabled', 'true', 'boolean', true),
  ('site_logo_url', '', 'text', true),
  ('contact_email', 'hello@coreconversion.com', 'email', true),
  ('social_twitter', 'https://twitter.com/coreconversion', 'url', true),
  ('social_linkedin', 'https://linkedin.com/company/coreconversion', 'url', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;
