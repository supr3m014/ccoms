# Hero Section Variations

I've created 3 different hero section variations for you to choose from. Each has a unique style and approach:

## Variation 1: Split Screen with Stats
**File:** `src/components/hero-variations/HeroVariation1.tsx`

**Style:** Clean, modern split-screen layout
- Left side: Content with statistics
- Right side: Large image with floating metric cards
- Features real Pexels images
- Shows growth metrics (+340% traffic, 0.8s load speed)
- Best for: Professional, data-driven approach

**Key Features:**
- Two-column grid layout
- Floating achievement cards overlaying the image
- Bold CTA buttons
- Statistics showcase (14 years, 100% hands-on, 0 outsourcing)
- Image: Analytics dashboard

---

## Variation 2: Full-Width Dark Hero
**File:** `src/components/hero-variations/HeroVariation2.tsx`

**Style:** Bold, dramatic full-width hero with dark background
- Background image with gradient overlay
- Centered content
- Animated blob elements
- Founder photo callout
- Stats grid at bottom
- Best for: Premium, high-impact first impression

**Key Features:**
- Full-width immersive experience
- Team collaboration background image
- Animated gradient blobs
- Checklist of key benefits
- Founder credibility section
- 4-column stats grid
- Image: Professional team working

---

## Variation 3: Modern Asymmetric Layout
**File:** `src/components/hero-variations/HeroVariation3.tsx`

**Style:** Contemporary asymmetric design with floating elements
- 60/40 split layout
- Service cards preview
- Floating metric overlays
- Partner logos section
- Best for: Tech-forward, modern aesthetic

**Key Features:**
- Asymmetric grid (7/5 columns)
- Three service preview cards
- Floating statistic cards on image
- Underlined text emphasis effect
- Partner/certification badges
- Image: Team collaboration

---

## How to Use

To replace the current hero section:

1. Choose your preferred variation
2. Open `/tmp/cc-agent/62668393/project/src/app/(public)/page.tsx`
3. Import your chosen variation at the top:
   ```tsx
   import HeroVariation1 from '@/components/hero-variations/HeroVariation1'
   // or HeroVariation2 or HeroVariation3
   ```
4. Replace the current hero section (lines 119-158) with:
   ```tsx
   <HeroVariation1 />
   ```

Let me know which one you prefer and I'll integrate it into the main page!

## Images Used

All images are from Pexels (royalty-free):
- Variation 1: Analytics dashboard and growth metrics
- Variation 2: Professional team collaboration
- Variation 3: Team strategy meeting

Each image properly represents digital marketing, analytics, and professional collaboration.
