# Security & Setup Guide

## Admin Login Credentials

**Email:** admin@ccoms.ph
**Password:** CoreConversion2024!

## How to Create the Admin User

The admin user needs to be created before you can log in. There are two ways to do this:

### Option 1: Using the Edge Function (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Find the `create-admin` function
4. Click "Invoke" or call it via HTTP:

```bash
curl -X POST https://funyypasczjmhejiloeh.supabase.co/functions/v1/create-admin \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter:
   - Email: admin@ccoms.ph
   - Password: CoreConversion2024!
   - Auto Confirm User: YES
5. Click "Create User"

## Security Features Implemented

### 1. Brute Force Protection

The system now includes rate limiting to prevent brute-force attacks:

- **3 Failed Attempts** = Account temporarily locked
- **15-Minute Cooldown** = After 3 failed attempts, the account is locked for 15 minutes
- **IP-Based Tracking** = Failed attempts are tracked by both email and IP address
- **Auto Cleanup** = Login attempts older than 24 hours are automatically removed

### 2. Database Security

- **Row Level Security (RLS)** enabled on all tables
- **Published/Draft Status** for all blog posts and pages
- **Visibility Control** (public/private/password-protected)
- **Admin-Only Access** to sensitive data

### 3. Authentication Security

- **Secure Password Requirements** (minimum 8 characters)
- **Email Confirmation** (can be enabled in Supabase settings)
- **Session Management** with automatic expiration
- **Protected Routes** for admin pages

## Database Structure

### Posts Table
- `status`: draft/published/scheduled/pending_review
- `visibility`: public/password_protected/private
- `published_at`: Timestamp when published
- `scheduled_at`: Schedule for future publishing

### Login Attempts Table
- Tracks all login attempts (successful and failed)
- Used for rate limiting and security monitoring
- Automatically cleaned up after 24 hours

## Hiding Unpublished Content

Blog posts are automatically hidden from public view based on:
- `status = 'published'`
- `visibility = 'public'`
- `published_at` is not null and not in the future

To hide posts:
1. Log in to Admin Panel
2. Go to Posts
3. Change status to "Draft" or visibility to "Private"
4. Save changes

## Production Deployment Notes

### Hostinger Deployment

Since you've deployed via GitHub sync to Hostinger:

1. **Environment Variables**: Make sure these are set in Hostinger:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://funyypasczjmhejiloeh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bnl5cGFzY3pqbWhlamlsb2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTEyMjQsImV4cCI6MjA4NDIyNzIyNH0.VHldmPAEOP13veCzcHLWtXd3tlUo4kbSGTmXfIlRHk4
   ```

2. **Build Command**: `npm run build`
3. **Start Command**: `npm run start`
4. **Node Version**: 18.x or higher

### Security Best Practices

1. **Never commit `.env` files** to Git (already in .gitignore)
2. **Use strong passwords** for all admin accounts
3. **Enable 2FA** in Supabase dashboard if available
4. **Monitor login attempts** regularly in the admin panel
5. **Keep dependencies updated** with `npm update`

## Monitoring Login Attempts

To view login attempts:

1. Log in to Supabase Dashboard
2. Go to SQL Editor
3. Run:
```sql
SELECT email, ip_address, success, attempt_time
FROM login_attempts
ORDER BY attempt_time DESC
LIMIT 50;
```

## Troubleshooting

### Can't Log In?

1. **Check if admin user exists**:
   - Go to Supabase Dashboard > Authentication > Users
   - Look for admin@ccoms.ph

2. **Account locked?**:
   - Wait 15 minutes after 3 failed attempts
   - Or clear attempts in database:
   ```sql
   DELETE FROM login_attempts WHERE email = 'admin@ccoms.ph';
   ```

3. **Password reset**:
   - Go to Supabase Dashboard > Authentication > Users
   - Click on the user
   - Click "Send Password Recovery"

### Build Fails?

1. **Check environment variables** are set
2. **Run `npm install`** to ensure dependencies are installed
3. **Check for TypeScript errors** with `npm run typecheck`

## Next Steps

1. ✅ Create admin user using one of the methods above
2. ✅ Log in to /admin/login
3. ✅ Update blog posts status to "published" or "draft"
4. ✅ Test the security features
5. ✅ Monitor login attempts

## Support

For issues or questions, check:
- Supabase Dashboard for database logs
- Browser console for frontend errors
- Network tab for API failures
