# Deployment Checklist - Core Conversion Website

## Pre-Deployment Checklist

### ✅ Repository Setup
- [x] `package.json` is at root level
- [x] `.env` is in `.gitignore`
- [x] `.next/` is in `.gitignore`
- [x] All code committed to GitHub
- [x] Repository synced with GitHub

### ✅ Package.json Configuration
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",  ← Uses $PORT for Hostinger
    "lint": "next lint"
  }
}
```

### ✅ Environment Variables
Required variables for production:
```
NEXT_PUBLIC_SUPABASE_URL=https://funyypasczjmhejiloeh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bnl5cGFzY3pqbWhlamlsb2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTEyMjQsImV4cCI6MjA4NDIyNzIyNH0.VHldmPAEOP13veCzcHLWtXd3tlUo4kbSGTmXfIlRHk4
NODE_ENV=production
```

### ✅ Database Setup
- [x] Supabase project created
- [x] Database migrations applied
- [x] Tables created (posts, pages, categories, etc.)
- [x] Row Level Security enabled
- [x] Login attempts table for brute-force protection

---

## Hostinger Deployment Steps

### Step 1: Create Node.js Application in Hostinger
1. Log in to Hostinger hPanel
2. Navigate to **Node.js** section
3. Click **"Create Application"**
4. Configure:
   - **Application root:** `/`
   - **Application URL:** `your-domain.com`
   - **Startup file:** `npm run start`
   - **Node.js version:** `18.x` or `20.x`
   - **Mode:** `Production`

### Step 2: Connect GitHub Repository
1. Click **"Connect to GitHub"**
2. Authorize Hostinger
3. Select repository: `your-repo-name`
4. Select branch: `main`
5. Enable **Auto-Deploy**: ON

### Step 3: Add Environment Variables
In Hostinger Node.js settings → Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://funyypasczjmhejiloeh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NODE_ENV` | `production` |

### Step 4: Deploy
1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. Check logs for success messages

### Step 5: Verify Deployment
- [ ] Site loads at your domain
- [ ] Homepage displays correctly
- [ ] All pages accessible
- [ ] No 404 errors
- [ ] No console errors
- [ ] SSL/HTTPS working

---

## Post-Deployment Tasks

### 1. Create Admin User
**IMPORTANT:** Admin user must be created before login works.

**Option A: Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `funyypasczjmhejiloeh`
3. Go to **Authentication** → **Users**
4. Click **"Add User"**
5. Enter:
   - Email: `admin@ccoms.ph`
   - Password: `CoreConversion2024!`
   - ✓ Check "Auto Confirm User"
6. Click **"Create User"**

**Option B: Call Edge Function**
```bash
curl -X POST https://funyypasczjmhejiloeh.supabase.co/functions/v1/create-admin \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Test Admin Login
1. Go to `your-domain.com/admin/login`
2. Enter:
   - Email: `admin@ccoms.ph`
   - Password: `CoreConversion2024!`
3. Verify you can access admin panel

### 3. Hide Demo Blog Posts
1. Log in to admin panel
2. Go to **Posts** section
3. For each demo post:
   - Change status to **"Draft"** OR
   - Change visibility to **"Private"**
4. Click **"Save"**

### 4. Test Contact Form
1. Go to `your-domain.com/contact`
2. Fill out form
3. Submit
4. Check in admin panel if submission appears

### 5. Monitor Logs
1. Hostinger Panel → Node.js → Your App
2. Click **"Logs"** tab
3. Check for any errors

---

## Updating the Website

### Method 1: Git Push (Auto-Deploy)
```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Hostinger automatically deploys in ~2-3 minutes
```

### Method 2: Manual Deploy
1. Push changes to GitHub
2. Go to Hostinger Node.js panel
3. Click **"Deploy"** or **"Rebuild"**

---

## Testing Checklist

### Frontend Testing
- [ ] Homepage loads
- [ ] About page loads
- [ ] Services pages load
- [ ] Blog page loads
- [ ] Contact page loads
- [ ] All images display
- [ ] Navigation works
- [ ] Mobile responsive

### Admin Panel Testing
- [ ] Login page loads
- [ ] Can log in successfully
- [ ] Dashboard displays
- [ ] Can view posts
- [ ] Can view pages
- [ ] Can view contacts
- [ ] Can view interactions
- [ ] All admin pages load

### Functionality Testing
- [ ] Contact form submits
- [ ] Contact form shows success message
- [ ] Contact appears in admin panel
- [ ] Blog posts display correctly
- [ ] Search works in admin
- [ ] Can create new posts
- [ ] Can edit posts
- [ ] Can delete posts

### Security Testing
- [ ] HTTPS enabled
- [ ] Login rate limiting works (3 attempts)
- [ ] Admin pages require login
- [ ] Unpublished posts are hidden
- [ ] Private posts are not accessible
- [ ] Environment variables not exposed

---

## Troubleshooting Guide

### Build Fails
**Error:** "Cannot find package.json"
- ✅ Verify `package.json` is at root
- ✅ Check Application root is `/`

**Error:** "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate lock file"
git push
```

### Site Not Loading
**Error:** 502 Bad Gateway
- ✅ Check `start` script has `-p $PORT`
- ✅ Restart application in Hostinger
- ✅ Check logs for errors

**Error:** 404 Not Found
- ✅ Verify domain is correctly configured
- ✅ Check DNS settings
- ✅ Wait for DNS propagation (up to 24 hours)

### Admin Login Issues
**Can't log in:**
1. Verify admin user exists in Supabase
2. Check environment variables in Hostinger
3. Try password reset in Supabase dashboard

**Account locked:**
- Wait 15 minutes (rate limit cooldown)
- Or clear attempts in Supabase SQL Editor:
```sql
DELETE FROM login_attempts WHERE email = 'admin@ccoms.ph';
```

### Environment Variables Not Working
1. Verify added in Hostinger panel (not .env file)
2. Must start with `NEXT_PUBLIC_` for client-side
3. Restart application after adding
4. Check logs for any errors

---

## Maintenance Tasks

### Weekly
- [ ] Check application logs for errors
- [ ] Monitor failed login attempts
- [ ] Review contact form submissions
- [ ] Check site performance

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Check for security updates
- [ ] Review and publish draft posts
- [ ] Backup database (Supabase auto-backups)
- [ ] Check SSL certificate (auto-renews)

### Quarterly
- [ ] Review site analytics
- [ ] Update content and images
- [ ] Test all forms and functionality
- [ ] Check mobile responsiveness
- [ ] Review security settings

---

## Quick Commands Reference

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Test production build
npm run start        # Run production server
npm run lint         # Check for code issues
```

### Git Commands
```bash
git status           # Check what changed
git add .            # Stage all changes
git commit -m "msg"  # Commit with message
git push origin main # Push to GitHub (triggers deploy)
git pull origin main # Pull latest changes
```

### Hostinger Actions
- **Deploy:** Push to GitHub (auto-deploy)
- **Restart:** Hostinger Panel → Restart Application
- **Logs:** Hostinger Panel → Logs tab
- **Variables:** Hostinger Panel → Environment Variables

---

## Important URLs

### Production Site
- **Website:** https://your-domain.com
- **Admin Login:** https://your-domain.com/admin/login

### Development Tools
- **Hostinger Panel:** https://hpanel.hostinger.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/funyypasczjmhejiloeh
- **GitHub Repository:** https://github.com/your-username/your-repo

### Documentation
- See `HOSTINGER_DEPLOYMENT.md` - Full deployment guide
- See `SECURITY_AND_SETUP.md` - Security features & admin setup
- See `README.md` - Project overview

---

## Support Contacts

### Technical Support
- **Hostinger Support:** Live chat in hPanel
- **Supabase Support:** https://supabase.com/support
- **Next.js Docs:** https://nextjs.org/docs

### Useful Resources
- Hostinger Node.js Guide: https://support.hostinger.com/en/articles/5857221
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Auth: https://supabase.com/docs/guides/auth

---

## Current Status

- ✅ Repository setup complete
- ✅ Database migrations applied
- ✅ Security features implemented
- ✅ Build configuration correct
- ✅ Ready for Hostinger deployment
- ⏳ Pending: Create admin user
- ⏳ Pending: Deploy to Hostinger
- ⏳ Pending: Test production site

---

## Summary

Your website is **100% ready** for deployment to Hostinger. Everything is configured correctly:

✅ **package.json** at root with correct scripts
✅ **Build** process tested and working
✅ **Environment variables** documented
✅ **Security** features implemented
✅ **Database** setup complete
✅ **GitHub** repository ready

**Next Steps:**
1. Set up Node.js app in Hostinger
2. Connect GitHub repository
3. Add environment variables
4. Click Deploy
5. Create admin user
6. Test everything

**Need help?** Check `HOSTINGER_DEPLOYMENT.md` for detailed instructions.
