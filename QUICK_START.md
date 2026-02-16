# Quick Start - Deploy to Hostinger Now!

## ⚡ 5-Minute Deployment Guide

### Prerequisites ✅
- [x] GitHub repository with your code
- [x] Hostinger account with Node.js hosting
- [x] Supabase project (already configured)

---

## Step 1: Hostinger Setup (2 minutes)

1. **Log in to Hostinger:** https://hpanel.hostinger.com

2. **Create Node.js App:**
   - Click **Node.js** in sidebar
   - Click **Create Application**
   - Fill in:
     ```
     Application root: /
     Application URL: your-domain.com
     Startup file: npm run start
     Node.js version: 18.x
     Mode: Production
     ```

3. **Connect GitHub:**
   - Click **Connect to GitHub**
   - Select your repository
   - Select branch: `main`
   - Enable **Auto-Deploy**: ✓ ON

---

## Step 2: Environment Variables (1 minute)

In Hostinger, add these 3 variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://funyypasczjmhejiloeh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bnl5cGFzY3pqbWhlamlsb2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTEyMjQsImV4cCI6MjA4NDIyNzIyNH0.VHldmPAEOP13veCzcHLWtXd3tlUo4kbSGTmXfIlRHk4
NODE_ENV=production
```

---

## Step 3: Deploy (2 minutes)

1. Click **Deploy** button
2. Wait for build (shows progress)
3. Done! Site is live ✨

---

## Step 4: Create Admin User (1 minute)

1. Go to: https://supabase.com/dashboard/project/funyypasczjmhejiloeh
2. Click **Authentication** → **Users**
3. Click **Add User**
4. Enter:
   ```
   Email: admin@ccoms.ph
   Password: CoreConversion2024!
   ✓ Auto Confirm User: YES
   ```
5. Click **Create User**

---

## Step 5: Test Login (30 seconds)

1. Go to: `your-domain.com/admin/login`
2. Login with:
   ```
   Email: admin@ccoms.ph
   Password: CoreConversion2024!
   ```
3. You're in! 🎉

---

## That's It! 🚀

Your website is now live and ready to use.

### What's Working:
✅ Website at your domain
✅ Admin panel at `/admin/login`
✅ Contact form
✅ Blog pages
✅ All services pages
✅ Security features (rate limiting)
✅ Auto-deploy on git push

### Next Steps:
- Update blog posts (set to draft/published)
- Customize content
- Add your own images
- Test contact form

---

## Need More Help?

📚 **Detailed Guides:**
- **Full deployment guide:** See `HOSTINGER_DEPLOYMENT.md`
- **Security setup:** See `SECURITY_AND_SETUP.md`
- **Complete checklist:** See `DEPLOYMENT_CHECKLIST.md`

🆘 **Having Issues?**
- Check Hostinger logs (Logs tab)
- Verify environment variables
- Check package.json is at root
- Contact Hostinger support

---

## Key Configuration ⚙️

Your project is configured correctly with:

**package.json:**
```json
{
  "scripts": {
    "start": "next start -p $PORT"  ← Uses Hostinger's PORT
  }
}
```

**Required files at root:**
- ✅ package.json
- ✅ next.config.js
- ✅ tsconfig.json

**GitHub sync:**
- ✅ Auto-deploy enabled
- ✅ Push to main = automatic deployment

---

## Quick Reference

### Update Website
```bash
git add .
git commit -m "Your changes"
git push origin main
# Hostinger deploys automatically in 2-3 minutes
```

### Admin Credentials
```
Email: admin@ccoms.ph
Password: CoreConversion2024!
URL: your-domain.com/admin/login
```

### Environment Variables (in Hostinger)
```
NEXT_PUBLIC_SUPABASE_URL → Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY → Supabase anon key
NODE_ENV → production
```

### Support
- Hostinger: hPanel live chat
- Supabase: https://supabase.com/support
- Logs: Hostinger Panel → Logs

---

## Troubleshooting

**Build fails?**
- Check package.json is at root
- Verify Application root is `/`

**502 Error?**
- Check start script has `-p $PORT`
- Restart app in Hostinger

**Can't login?**
- Create admin user in Supabase first
- Check environment variables in Hostinger

**Still stuck?**
- Check `DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting
- View logs in Hostinger panel
- Contact Hostinger support

---

**You're all set!** Your website is production-ready and secure. 🎊
