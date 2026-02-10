/*
  # Seed Sample Blog Posts
  
  This migration creates sample blog posts to populate the blog section
  and demonstrate the CMS functionality.
  
  1. Posts Created
    - 5 sample blog posts on digital marketing topics
    - All posts are published and visible
    - Includes SEO metadata
    - Proper content structure
*/

-- Get a user ID to assign as author (use the first admin user if exists)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to get the first user from auth.users
  SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  
  -- If no user found, create a system user for seeding
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (id, email) 
    VALUES (gen_random_uuid(), 'system@coreconversion.com')
    RETURNING id INTO admin_user_id;
  END IF;

  -- Insert blog posts
  INSERT INTO posts (title, slug, content, excerpt, status, visibility, meta_title, meta_description, author_id, published_at, comments_enabled)
  VALUES
  (
    'Why Technical SEO Matters More Than Ever in 2024',
    'why-technical-seo-matters-2024',
    E'Technical SEO has evolved beyond simple page speed optimization. In 2024, search engines are evaluating hundreds of signals to determine which sites deserve top rankings.\n\nCore Web Vitals, mobile-first indexing, and JavaScript rendering are now table stakes. But the real competitive advantage comes from understanding how these technical factors work together.\n\nHere''s what actually moves the needle:\n\n## Site Architecture\n\nA well-structured site helps both users and search engines understand your content hierarchy. Flat architecture with clear internal linking creates pathways for PageRank to flow efficiently.\n\n## Page Speed Beyond the Basics\n\nIt''s not just about fast loading times. Time to Interactive, First Contentful Paint, and Cumulative Layout Shift all impact user experience and rankings.\n\n## Mobile Optimization\n\nMobile-first indexing means Google primarily uses your mobile site for ranking. Responsive design isn''t enough—your mobile experience needs to be exceptional.\n\n## Structured Data\n\nSchema markup helps search engines understand your content context. Rich results drive higher CTRs, which signals quality to search algorithms.\n\nThe key is treating technical SEO as ongoing optimization, not a one-time fix.',
    'Technical SEO in 2024 goes far beyond basic optimization. Learn what actually moves the needle for rankings and organic traffic.',
    'published',
    'public',
    'Why Technical SEO Matters More Than Ever in 2024',
    'Discover why technical SEO is critical in 2024 and learn the advanced strategies that actually impact rankings.',
    admin_user_id,
    NOW() - INTERVAL '5 days',
    true
  ),
  (
    'Answer Engine Optimization: Preparing for AI Search',
    'answer-engine-optimization-ai-search',
    E'Search is changing. ChatGPT, Google''s AI Overviews, and other AI-powered answers are reshaping how people find information.\n\nAnswer Engine Optimization (AEO) is about positioning your content to be the source AI systems reference when generating answers.\n\n## The Shift from Keywords to Concepts\n\nAI doesn''t just match keywords—it understands concepts, context, and relationships between topics. Your content needs to demonstrate topical authority.\n\n## Structured Content Wins\n\nAI systems prefer content that''s clearly organized with:\n- Clear headings and hierarchy\n- Concise, authoritative answers\n- Supporting evidence and examples\n- Logical content flow\n\n## Entity-Based SEO\n\nGoogle''s Knowledge Graph and similar AI systems rely on entities (people, places, things) rather than just keywords. Establish your brand as a recognized entity in your niche.\n\n## Direct Answers\n\nProvide clear, concise answers early in your content. AI systems often pull from the first clear answer they find.\n\n## Building Authority\n\nAI systems evaluate authority through:\n- Author credentials\n- External validation (links, mentions)\n- Content depth and accuracy\n- User engagement signals\n\nAEO isn''t replacing SEO—it''s the next evolution. Start optimizing for AI now.',
    'AI-powered search is here. Learn how to optimize your content for ChatGPT, Google AI Overviews, and other answer engines.',
    'published',
    'public',
    'Answer Engine Optimization: Preparing for AI Search',
    'Learn AEO strategies to position your content as the source for AI-generated answers in ChatGPT and Google.',
    admin_user_id,
    NOW() - INTERVAL '3 days',
    true
  ),
  (
    'Local SEO: How to Dominate Map Results',
    'local-seo-dominate-map-results',
    E'Local SEO is one of the highest-ROI channels for businesses with physical locations. Map pack rankings can drive consistent foot traffic and phone calls.\n\n## Google Business Profile Optimization\n\nYour GBP is the foundation of local SEO:\n- Complete every section\n- Use relevant categories\n- Add high-quality photos regularly\n- Post weekly updates\n- Respond to every review\n\n## Citation Building\n\nNAP (Name, Address, Phone) consistency across directories signals legitimacy. Focus on:\n- Major directories (Yelp, Yellow Pages, BBB)\n- Industry-specific directories\n- Local chamber of commerce\n- News and PR mentions\n\n## Review Strategy\n\nReviews impact both rankings and conversion rates:\n- Ask customers at the right moment\n- Make it easy (direct links)\n- Respond to all reviews (especially negative ones)\n- Use review keywords naturally\n\n## Local Content\n\nCreate content targeting local intent:\n- Location-specific service pages\n- Local news and events\n- Community involvement\n- Neighborhood guides\n\n## Technical Local SEO\n\n- Schema markup for local business\n- Location pages for multi-location businesses\n- Mobile optimization (most local searches are mobile)\n- Local link building\n\nLocal SEO is competitive, but the businesses that execute consistently win.',
    'Local SEO drives foot traffic and phone calls. Learn the strategies that actually work for map pack rankings.',
    'published',
    'public',
    'Local SEO: How to Dominate Google Map Results',
    'Complete guide to local SEO including GBP optimization, citations, reviews, and technical local SEO.',
    admin_user_id,
    NOW() - INTERVAL '7 days',
    true
  ),
  (
    'Web Performance: The Hidden SEO Factor',
    'web-performance-hidden-seo-factor',
    E'Page speed is officially a ranking factor. But the real impact of web performance goes deeper than Core Web Vitals scores.\n\n## User Experience Impact\n\nSlow sites have:\n- Higher bounce rates\n- Lower time on site\n- Reduced conversions\n- Negative brand perception\n\nThese behavioral signals feed back into rankings.\n\n## Technical Performance Factors\n\n### Server Response Time\n- Use a CDN\n- Optimize database queries\n- Implement caching strategies\n- Choose quality hosting\n\n### Image Optimization\n- Use modern formats (WebP, AVIF)\n- Implement lazy loading\n- Serve responsive images\n- Compress without quality loss\n\n### JavaScript Execution\n- Defer non-critical JS\n- Remove unused code\n- Use code splitting\n- Implement service workers\n\n### CSS Optimization\n- Remove unused CSS\n- Inline critical CSS\n- Use CSS containment\n- Minimize render-blocking resources\n\n## Monitoring Performance\n\n- Real User Monitoring (RUM) data\n- Lighthouse CI in your pipeline\n- PageSpeed Insights tracking\n- Search Console Core Web Vitals report\n\n## Performance Budget\n\nSet targets:\n- Total page weight < 1MB\n- Time to Interactive < 3s\n- First Contentful Paint < 1.5s\n- Cumulative Layout Shift < 0.1\n\nPerformance optimization is ongoing. Fast sites win.',
    'Web performance impacts more than just rankings. Learn how page speed affects user experience and SEO.',
    'published',
    'public',
    'Web Performance: The Hidden SEO Factor',
    'Deep dive into web performance optimization and its impact on SEO, user experience, and conversions.',
    admin_user_id,
    NOW() - INTERVAL '10 days',
    true
  ),
  (
    'Content Strategy That Actually Drives Conversions',
    'content-strategy-drives-conversions',
    E'Most content strategies focus on traffic. But traffic without conversions is just vanity metrics.\n\n## Intent-Based Content\n\nUnderstand the search intent behind every keyword:\n- Informational: Blog posts, guides\n- Navigational: Brand pages\n- Commercial: Comparison pages\n- Transactional: Product/service pages\n\nMatch content format to intent.\n\n## The Conversion Funnel\n\n### Top of Funnel (Awareness)\n- Educational content\n- Industry insights\n- Problem identification\n- No hard sell\n\n### Middle of Funnel (Consideration)\n- Solution comparisons\n- Case studies\n- Implementation guides\n- Soft CTAs\n\n### Bottom of Funnel (Decision)\n- Product pages\n- Pricing information\n- Customer testimonials\n- Strong CTAs\n\n## Content Quality Signals\n\n- Expertise (author credentials)\n- Experience (first-hand knowledge)\n- Authoritativeness (citations, references)\n- Trustworthiness (accurate, updated)\n\nGoogle''s E-E-A-T framework matters.\n\n## Internal Linking Strategy\n\nGuide users through your funnel:\n- Link from general to specific topics\n- Connect related content\n- Use descriptive anchor text\n- Build topical clusters\n\n## Content Updates\n\nFresh content ranks better:\n- Update statistics and examples\n- Add new sections\n- Improve existing sections\n- Fix broken links\n- Update meta descriptions\n\nContent strategy is about business outcomes, not just rankings.',
    'Learn how to create content that drives both rankings and conversions. Strategy beyond just traffic generation.',
    'published',
    'public',
    'Content Strategy That Actually Drives Conversions',
    'Build a content strategy focused on business outcomes. Learn how to create content that ranks and converts.',
    admin_user_id,
    NOW() - INTERVAL '14 days',
    true
  )
  ON CONFLICT (slug) DO NOTHING;
END $$;
