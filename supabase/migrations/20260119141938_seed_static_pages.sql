/*
  # Seed Static Pages into Database
  
  This migration populates the pages table with all static pages from the website
  so they can be edited through the admin panel.
  
  1. Pages Created
    - Home Page
    - About Page
    - Services Main Page
    - SEO Service Page
    - AEO Service Page
    - GEO Service Page
    - Local SEO Service Page
    - Website Development Service Page
    - Mobile App Development Service Page
    - Brand Marketing Design Service Page
    - Video Production Service Page
    - Contact Page
    - Case Studies Page
    - Blog Page
  
  2. Features
    - All pages are set to published
    - SEO meta information included
    - Proper slugs for routing
    - Categorized by type
*/

-- Insert Home Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Home',
  'home',
  'Core Conversion is a founder-led digital marketing agency that rebuilds what broken agencies destroyed. We deliver technical SEO, web development, and digital strategy that actually moves metrics—not just reports.',
  'Founder-led digital marketing agency specializing in technical SEO, web development, and measurable growth strategies.',
  'published',
  'public',
  'Core Conversion - Founder-Led Digital Marketing That Delivers Results',
  'Stop paying for guesswork. Get execution. Core Conversion is a founder-led agency that rebuilds what broken agencies destroyed.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert About Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'About',
  'about',
  'Learn about John Paul Carrasco and Core Conversion. 14 years of hands-on SEO and technical execution, no outsourcing, full accountability.',
  'Meet the founder-led team behind Core Conversion. Real technical execution, no outsourcing.',
  'published',
  'public',
  'About Core Conversion - Meet the Founder-Led Team',
  'Learn about John Paul Carrasco and the Core Conversion team. 14 years of hands-on experience, zero outsourcing.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Services Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Services',
  'services',
  'Comprehensive digital marketing services including SEO, web development, mobile apps, video production, and more. All executed hands-on by our team.',
  'Full-service digital marketing agency offering SEO, web development, and growth strategies.',
  'published',
  'public',
  'Digital Marketing Services - Core Conversion',
  'End-to-end digital marketing services: SEO, AEO, GEO, web development, mobile apps, video production, and brand design.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert SEO Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'SEO Services',
  'services/seo',
  'Technical SEO services that actually move rankings. We handle everything from site speed optimization to content strategy and link building.',
  'Professional SEO services focused on technical execution and measurable results.',
  'published',
  'public',
  'SEO Services - Technical SEO That Drives Rankings',
  'Technical SEO services including site audits, speed optimization, content strategy, and link building from Core Conversion.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert AEO Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'AEO Services',
  'services/aeo',
  'Answer Engine Optimization to get your brand featured in AI answers, voice search results, and featured snippets.',
  'AEO services to dominate AI search results and voice assistants.',
  'published',
  'public',
  'AEO Services - Answer Engine Optimization',
  'Answer Engine Optimization services to get your brand featured in AI-powered search results and voice assistants.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert GEO Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'GEO Services',
  'services/geo',
  'Generative Engine Optimization to make your brand discoverable in AI-generated content and recommendations.',
  'GEO services for AI engine visibility and discovery.',
  'published',
  'public',
  'GEO Services - Generative Engine Optimization',
  'Generative Engine Optimization services to ensure your brand appears in AI-generated content and recommendations.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Local SEO Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Local SEO Services',
  'services/local-seo',
  'Local SEO services to dominate map results, local search, and drive foot traffic to your business.',
  'Local SEO services for map rankings and local visibility.',
  'published',
  'public',
  'Local SEO Services - Dominate Local Search Results',
  'Local SEO services including Google Business Profile optimization, citation building, and review management.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Website Development Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Website Development',
  'services/website-development',
  'Fast, SEO-ready website development built for performance and conversions. Modern frameworks, clean code, and long-term maintainability.',
  'Professional website development services focused on speed and SEO.',
  'published',
  'public',
  'Website Development Services - Fast, SEO-Ready Builds',
  'Professional website development services using modern frameworks. Fast, secure, and optimized for search engines.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Mobile App Development Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Mobile App Development',
  'services/mobile-app-development',
  'Modern, secure mobile app development for iOS and Android. Native performance with cross-platform efficiency.',
  'Mobile app development services for iOS and Android platforms.',
  'published',
  'public',
  'Mobile App Development Services - iOS & Android Apps',
  'Professional mobile app development services. Build fast, secure native apps for iOS and Android.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Brand Marketing Design Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Brand Marketing & Design',
  'services/brand-marketing-design',
  'Digital-ready brand assets and marketing design that converts. From landing pages to full brand systems.',
  'Brand marketing and design services for digital-first businesses.',
  'published',
  'public',
  'Brand Marketing & Design Services',
  'Brand marketing and design services including logos, landing pages, and complete brand systems that convert.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Video Production Service Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Video Production',
  'services/video-production',
  'Cinematic video production for product launches, brand stories, and ad creatives that capture attention.',
  'Video production services for marketing and brand storytelling.',
  'published',
  'public',
  'Video Production Services - Cinematic Brand Videos',
  'Professional video production services for product launches, brand stories, and high-converting ad creatives.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Contact Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Contact',
  'contact',
  'Get in touch with Core Conversion. Talk directly with the founder. No sales scripts, no bait-and-switch.',
  'Contact Core Conversion for a free discovery call.',
  'published',
  'public',
  'Contact Core Conversion - Get Your Free Audit',
  'Contact Core Conversion for a free audit and discovery call. Talk directly with founder John Paul Carrasco.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Case Studies Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Case Studies',
  'case-studies',
  'Real results from real clients. See how Core Conversion has helped businesses achieve measurable growth.',
  'Case studies showing proven results from Core Conversion clients.',
  'published',
  'public',
  'Case Studies - Proven Results from Core Conversion',
  'Read case studies showing how Core Conversion has helped businesses achieve 340% traffic growth and more.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Blog Page
INSERT INTO pages (title, slug, content, excerpt, status, visibility, meta_title, meta_description, published_at)
VALUES (
  'Blog',
  'blog',
  'Expert insights on SEO, web development, and digital marketing strategy. Learn from 14 years of hands-on experience.',
  'Digital marketing insights and SEO best practices.',
  'published',
  'public',
  'Blog - Digital Marketing Insights from Core Conversion',
  'Expert insights on SEO, technical optimization, and digital strategy from the Core Conversion team.',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
