# Phase 2: Hostinger MySQL + PHP Bridge Setup Guide

## Overview
This guide walks you through migrating from Supabase to Hostinger's MySQL database using a custom PHP bridge API.

## Files Created

### 1. **database-schema.sql**
- Complete MySQL schema for all tables
- Upload to phpMyAdmin and execute

### 2. **api-bridge.php**
- PHP API that replaces Supabase
- Handles all database operations (SELECT, INSERT, UPDATE, DELETE)
- Manages authentication

### 3. **src/lib/php-bridge.ts**
- TypeScript client that mirrors Supabase API
- Used by your frontend code
- Makes HTTP calls to api-bridge.php

## Step-by-Step Setup

### Step 1: Create the Database in phpMyAdmin

1. Go to your Hostinger control panel
2. Open phpMyAdmin
3. Create a new database (it should auto-create with prefix `u520390024_`)
4. Copy the entire `database-schema.sql` file
5. Select the database
6. Go to "SQL" tab
7. Paste the SQL script and execute

**Expected result**: 10 tables created (users, blog_posts, posts, contact_submissions, case_studies, team_members, seo_scripts, pages, categories, tags)

### Step 2: Upload the PHP Bridge API

1. Go to your Hostinger File Manager
2. Upload `api-bridge.php` to your public_html directory
3. Make sure it's accessible at: `https://yourdomain.com/api-bridge.php`

**Test it**: Open your browser and go to `https://yourdomain.com/api-bridge.php`
- You should see: `{"error":"No route found"}` (this is expected)

### Step 3: Update Environment Variables

In your `.env.local` file, add:
```
NEXT_PUBLIC_API_URL=https://yourdomain.com/api-bridge.php
```

### Step 4: Update supabase.ts

Replace the content of `src/lib/supabase.ts` with:

```typescript
import { phpBridge } from './php-bridge'

export const supabase = phpBridge
```

This makes the entire codebase use the PHP bridge instead of Supabase without changing any other files.

### Step 5: Create an Admin User (Temporary)

1. Open phpMyAdmin
2. Go to the `users` table
3. Insert a new row with:
   - email: your@email.com
   - password: password123 (will be hashed when used)

Or run this SQL in phpMyAdmin:
```sql
INSERT INTO users (email, password) VALUES ('admin@example.com', '$2y$10$YourHashedPasswordHere');
```

### Step 6: Test the Setup

1. Start your local dev server: `npm run dev`
2. Go to `/admin/login`
3. Try logging in with the admin credentials created in Step 5
4. Check the browser console for any errors

## API Endpoints

The PHP bridge provides these endpoints:

### Authentication
- `GET /api-bridge.php?action=session` - Get current session
- `POST /api-bridge.php?action=sign-in` - Login
- `POST /api-bridge.php?action=sign-out` - Logout

### Database Operations
- `GET /api-bridge.php?table=<table_name>` - SELECT
- `POST /api-bridge.php?table=<table_name>` - INSERT
- `PUT /api-bridge.php?table=<table_name>` - UPDATE
- `DELETE /api-bridge.php?table=<table_name>&id=<id>` - DELETE

## Query Examples

### Get all blog posts
```typescript
const { data } = await supabase.from('blog_posts').select('*')
```

### Get count of posts
```typescript
const { data, count } = await supabase.from('posts').select('id', { count: 'exact', head: true })
```

### Search by slug
```typescript
const { data } = await supabase.from('blog_posts').select('*').eq('slug', 'my-post')
```

### Get with order
```typescript
const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
```

## Troubleshooting

### "Database connection failed"
- Check database credentials in api-bridge.php
- Verify database exists in phpMyAdmin

### Login not working
- Verify admin user exists in `users` table
- Check that password hashing is correct

### CORS errors
- Make sure api-bridge.php has CORS headers (already included)
- Check that NEXT_PUBLIC_API_URL is set correctly

### Missing tables
- Run database-schema.sql again
- Check phpMyAdmin to verify tables exist

## Next Steps

After successful setup:

1. **Import existing data** (if you have any) into the MySQL tables
2. **Test all admin features** thoroughly
3. **Deploy to production** when ready
4. **Set up backups** for your MySQL database

## Security Notes

⚠️ **Important**: Before going to production:
1. Implement proper password hashing (use bcrypt)
2. Add user authentication middleware to PHP
3. Validate all inputs in PHP
4. Use prepared statements (already done in api-bridge.php)
5. Add rate limiting to prevent abuse
6. Consider using JWT tokens instead of PHP sessions

## Additional Resources

- Database optimization queries can be added to api-bridge.php
- Consider adding caching layer (Redis/Memcached) if needed
- Set up automated MySQL backups in Hostinger
