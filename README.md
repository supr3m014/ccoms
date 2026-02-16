# Core Conversion Website - Next.js + Supabase

A modern, secure website built with Next.js 14, Supabase, and TailwindCSS. Features a full CMS admin panel, blog system, and contact management.

## 🚀 Quick Deploy to Hostinger

**Ready to deploy?** See [`QUICK_START.md`](./QUICK_START.md) for 5-minute deployment guide.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute deployment guide - start here! |
| **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** | Complete Hostinger Node.js deployment guide |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | Full deployment checklist and troubleshooting |
| **[SECURITY_AND_SETUP.md](./SECURITY_AND_SETUP.md)** | Security features and admin user setup |
| **[create-admin-user.sql](./create-admin-user.sql)** | SQL helper for admin user creation |

## ✨ Features

### Public Website
- ✅ Homepage with hero section (3 variations)
- ✅ About page
- ✅ Services pages (SEO, AEO, GEO, Local SEO, Web Dev, Mobile Apps, Video Production, Brand Marketing)
- ✅ Blog with search and grid/list view
- ✅ Case studies showcase
- ✅ Contact form with database storage
- ✅ Responsive design
- ✅ Smooth animations (Framer Motion, GSAP, Lenis)

### Admin Panel (`/admin`)
- ✅ Dashboard with statistics
- ✅ Full CMS for Pages and Posts
- ✅ Media library management
- ✅ Categories and tags system
- ✅ Contact form submissions viewer
- ✅ Interactions (comments/testimonials/reviews)
- ✅ SEO tools (meta tags, scripts, redirects, 404 logs)
- ✅ Site settings
- ✅ User management
- ✅ Global search across all content

### Security Features 🔒
- ✅ Brute force protection (3 attempts, 15-minute lockout)
- ✅ Rate limiting on login
- ✅ Row Level Security (RLS) on all database tables
- ✅ Visibility control (public/private/password-protected)
- ✅ Draft/published status for all content
- ✅ Admin-only access to sensitive data
- ✅ Secure password requirements
- ✅ IP-based attack prevention

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Animations:** Framer Motion, GSAP
- **Smooth Scroll:** Lenis
- **Icons:** Lucide React
- **Hosting:** Hostinger Node.js

## 📦 Project Structure

```
project-root/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/            # Public pages
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── about/           # About page
│   │   │   ├── blog/            # Blog pages
│   │   │   ├── services/        # Service pages
│   │   │   ├── contact/         # Contact page
│   │   │   └── ...
│   │   ├── admin/               # Admin panel
│   │   │   ├── layout.tsx       # Admin layout with sidebar
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── posts/           # Blog post management
│   │   │   ├── pages/           # Page management
│   │   │   ├── media/           # Media library
│   │   │   ├── contacts/        # Contact submissions
│   │   │   ├── seo/             # SEO tools
│   │   │   └── ...
│   │   ├── globals.css          # Global styles
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── Header.tsx           # Site header
│   │   ├── Footer.tsx           # Site footer
│   │   ├── CTAButtons.tsx       # Call-to-action buttons
│   │   ├── Toast.tsx            # Toast notifications
│   │   └── ...
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── ToastContext.tsx     # Toast notification context
│   └── lib/
│       └── supabase.ts          # Supabase client
├── public/                      # Static files
│   ├── logo.png
│   └── core-conversion.png
├── supabase/
│   ├── migrations/              # Database migrations
│   └── functions/               # Edge functions
│       └── create-admin/        # Admin user creation function
├── package.json                 # Dependencies and scripts ← At ROOT!
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # TailwindCSS configuration
└── .env                        # Environment variables (not in git)
```

## 🔧 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Supabase account

### Local Development

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd project-root
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create `.env` file in root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://funyypasczjmhejiloeh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

4. **Run development server:**
```bash
npm run dev
```

Open http://localhost:3000

5. **Build for production:**
```bash
npm run build
npm run start
```

## 🚀 Deployment to Hostinger

### Key Requirements for Hostinger

**Your project is already configured correctly:**

✅ **package.json at root** - Hostinger requires this
```
/project-root/package.json  ← Must be here!
```

✅ **Start script with PORT variable:**
```json
{
  "scripts": {
    "start": "next start -p $PORT"
  }
}
```
This is critical! Hostinger assigns a PORT variable dynamically.

✅ **Build script:**
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

✅ **All dependencies in package.json** - No missing dependencies

### Quick Deploy Steps

**See [`QUICK_START.md`](./QUICK_START.md) for detailed 5-minute guide.**

1. **Create Node.js app in Hostinger**
2. **Connect GitHub repository**
3. **Add environment variables**
4. **Click Deploy**
5. **Wait 2-3 minutes**
6. **Done!** ✨

### What Hostinger Does Automatically

When you deploy, Hostinger runs:
```bash
npm install     # Installs all dependencies from package.json
npm run build   # Builds your Next.js app (.next folder)
npm run start   # Starts production server on dynamic PORT
```

### Environment Variables for Hostinger

Add these in Hostinger panel (NOT in .env file):
```
NEXT_PUBLIC_SUPABASE_URL=https://funyypasczjmhejiloeh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NODE_ENV=production
```

### Complete Deployment Guide

📖 See [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md) for:
- Step-by-step screenshots
- Troubleshooting common issues
- Performance optimization
- Monitoring and logs
- Security best practices

## 🔐 Admin Access

### Creating Admin User

**Before you can log in, create an admin user:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/funyypasczjmhejiloeh)
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Enter:
   - Email: `admin@ccoms.ph`
   - Password: `CoreConversion2024!`
   - ✓ Auto Confirm User
5. Click **"Create User"**

### Login

1. Go to `/admin/login`
2. Use credentials:
   ```
   Email: admin@ccoms.ph
   Password: CoreConversion2024!
   ```

**Security Note:** After 3 failed login attempts, the account is locked for 15 minutes (brute-force protection).

## 🛠️ Available Scripts

```bash
npm run dev         # Start development server (port 3000)
npm run build       # Build for production
npm run start       # Start production server (uses $PORT variable)
npm run lint        # Run ESLint
npm run typecheck   # Check TypeScript types
```

## 📝 Environment Variables

### Required Variables

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional
NODE_ENV=production
```

**Important Notes:**
- Variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- Never commit `.env` file to git (already in `.gitignore`)
- In Hostinger, add via panel Environment Variables section
- Restart application after adding/changing variables

## 🔒 Security Features

### Brute Force Protection
- ✅ 3 failed login attempts = 15-minute lockout
- ✅ IP-based tracking
- ✅ Automatic cleanup of old attempts
- ✅ Database logging of all login attempts

### Database Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Admin-only access policies
- ✅ Secure password hashing (Supabase)
- ✅ SQL injection prevention

### Content Security
- ✅ Draft/published status control
- ✅ Public/private/password-protected visibility
- ✅ Admin authentication required for sensitive content

See [`SECURITY_AND_SETUP.md`](./SECURITY_AND_SETUP.md) for complete security documentation.

## 🐛 Troubleshooting

### Common Hostinger Issues

**Build fails: "Cannot find package.json"**
- ✅ Verify `package.json` is at repository root (not in subdirectory)
- ✅ Check Hostinger "Application root" is set to `/`

**502 Bad Gateway Error**
- ✅ Verify start script has `-p $PORT`: `"start": "next start -p $PORT"`
- ✅ Restart application in Hostinger panel
- ✅ Check logs for errors

**Environment variables not working**
- ✅ Add in Hostinger panel (not .env file)
- ✅ Check variable names (case-sensitive)
- ✅ Restart application after adding
- ✅ Variables with `NEXT_PUBLIC_` are accessible in browser

**Login not working**
- ✅ Create admin user in Supabase first
- ✅ Verify environment variables in Hostinger
- ✅ Check Supabase connection

See [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) for complete troubleshooting guide.

## 📊 Project Status

### ✅ Completed
- [x] Next.js 14 setup with App Router
- [x] Supabase database configuration
- [x] All database migrations applied
- [x] Security features implemented
- [x] Admin panel complete
- [x] Public website complete
- [x] Hostinger deployment configuration
- [x] Build process tested and working
- [x] Documentation complete

### ⏳ Pending
- [ ] Create admin user in Supabase
- [ ] Deploy to Hostinger
- [ ] Test production site
- [ ] Add real content/blog posts

## 📞 Support & Resources

### Documentation
- 📖 [Quick Start](./QUICK_START.md) - 5-minute deploy
- 🚀 [Hostinger Guide](./HOSTINGER_DEPLOYMENT.md) - Complete deployment
- ✅ [Checklist](./DEPLOYMENT_CHECKLIST.md) - Full checklist
- 🔒 [Security](./SECURITY_AND_SETUP.md) - Security setup

### External Resources
- **Hostinger Support:** https://support.hostinger.com
- **Hostinger Node.js Guide:** https://support.hostinger.com/en/articles/5857221
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

### Getting Help
1. Check documentation files above
2. Review Hostinger logs (Logs tab)
3. Check Supabase logs (Dashboard → Logs)
4. Contact Hostinger support (24/7 live chat)

## 📄 License

This project is proprietary and confidential.

## 👨‍💻 Developer

Core Conversion - Digital Marketing & Web Development
- Website: https://coreconversion.com
- Email: admin@ccoms.ph

---

## 🎯 Next Steps

1. **Deploy to Hostinger** - See [`QUICK_START.md`](./QUICK_START.md)
2. **Create Admin User** - See [`SECURITY_AND_SETUP.md`](./SECURITY_AND_SETUP.md)
3. **Test Production Site** - Follow [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)
4. **Add Content** - Log in to admin panel and start adding posts

---

**Ready to go live?** Start with [`QUICK_START.md`](./QUICK_START.md) → 5 minutes to production! 🚀
