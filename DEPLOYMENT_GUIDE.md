# El Dorado Platform - Complete Deployment Guide

This guide will walk you through deploying your gaming platform from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account (you have this ✓)
- [ ] All files uploaded to GitHub repository
- [ ] Supabase account created
- [ ] Vercel account created

---

## 🗂️ Step 1: Upload All Files to GitHub

### Files to Upload (33 Total)

Upload these files to your repository at https://github.com/3jikeanekwe/3l-Dorado

#### Root Directory Files (13 files)
1. `package.json`
2. `next.config.js`
3. `tsconfig.json`
4. `tailwind.config.ts`
5. `postcss.config.js`
6. `.env.local.example`
7. `.gitignore`
8. `.eslintrc.json`
9. `middleware.ts`
10. `README.md`
11. `DEPLOYMENT_GUIDE.md`

#### Lib Folder (4 files)
12. `lib/supabase/client.ts`
13. `lib/supabase/server.ts`
14. `lib/supabase/middleware.ts`
15. `lib/hooks/useAuth.ts`
16. `lib/utils/helpers.ts`

#### Types Folder (1 file)
17. `types/database.types.ts`

#### Supabase Folder (1 file)
18. `supabase/migrations/001_initial_schema.sql`

#### App Folder (9 files)
19. `app/globals.css`
20. `app/layout.tsx`
21. `app/page.tsx`
22. `app/(auth)/login/page.tsx`
23. `app/(auth)/signup/page.tsx`
24. `app/api/auth/callback/route.ts`
25. `app/(admin)/layout.tsx`
26. `app/(admin)/dashboard/page.tsx`
27. `app/(admin)/dashboard/games/page.tsx`
28. `app/(admin)/dashboard/games/create/page.tsx`
29. `app/(admin)/dashboard/invites/page.tsx`
30. `app/(user)/layout.tsx`
31. `app/(user)/lobby/page.tsx`
32. `app/(user)/profile/page.tsx`

#### Components Folder (1 file)
33. `components/ui/Button.tsx`

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in details:
   - **Organization**: Select or create one
   - **Name**: `el-dorado-platform`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (for now)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### 2.2 Run Database Migration

1. In your Supabase project, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Copy the ENTIRE content from `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

### 2.3 Verify Database Setup

1. Click **"Database"** → **"Tables"** in the left sidebar
2. You should see these tables:
   - ✅ profiles
   - ✅ admin_invites
   - ✅ games
   - ✅ game_sessions
   - ✅ session_participants
   - ✅ transactions

3. Click **"Table Editor"** → **"admin_invites"**
4. You should see one row with email: `3jikemuwa@gmail.com`

### 2.4 Get Your API Credentials

1. Click **"Settings"** → **"API"** (in left sidebar)
2. Copy these two values (you'll need them later):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Repository

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your repository: `3jikeanekwe/3l-Dorado`
3. Click **"Import"**

### 3.3 Configure Project Settings

**Framework Preset**: Next.js (should auto-detect)

**Build and Output Settings**: Leave as default

**Environment Variables**: Click **"Add"** and enter these:

```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
NEXT_PUBLIC_ADMIN_EMAIL=3jikemuwa@gmail.com
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Important**: For `NEXT_PUBLIC_APP_URL`, you'll need to:
1. First deploy with a temporary value like `https://placeholder.vercel.app`
2. After deployment, copy your actual Vercel URL
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_APP_URL` with your real URL
5. Redeploy

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" when done
4. Click **"Visit"** to see your live site

---

## 🔐 Step 4: Configure Supabase Authentication

### 4.1 Add Your Vercel Domain to Supabase

1. Go back to Supabase dashboard
2. Click **"Authentication"** → **"URL Configuration"**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: Add these lines:
     ```
     https://your-project.vercel.app/**
     https://your-project.vercel.app/api/auth/callback
     ```
4. Click **"Save"**

### 4.2 Update Vercel Environment Variable

1. Go to Vercel dashboard → Your project
2. Click **"Settings"** → **"Environment Variables"**
3. Find `NEXT_PUBLIC_APP_URL`
4. Click **"Edit"**
5. Change value to your actual Vercel URL
6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"..."** on latest deployment → **"Redeploy"**

---

## ✅ Step 5: Test Your Deployment

### 5.1 Create Your Admin Account

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Click **"Sign Up"**
3. Enter:
   - **Username**: Your choice
   - **Email**: `3jikemuwa@gmail.com` (MUST use this for admin access)
   - **Password**: Create a secure password
4. Check the terms checkbox
5. Click **"Create Account"**
6. You'll be redirected to login page
7. Login with your credentials

### 5.2 Verify Admin Access

1. After login, you should be redirected to `/dashboard`
2. You should see the admin dashboard with:
   - Total Users, Total Games, Active Sessions stats
   - Sidebar with Dashboard, Games, Invites links
3. Click **"Games"** - you should see "Create Game" button
4. Click **"Invites"** - you should be able to send admin invites

### 5.3 Test User Flow

1. Open an incognito/private browser window
2. Go to your Vercel URL
3. Click **"Sign Up"**
4. Create a regular user account (different email)
5. After login, you should be redirected to `/lobby`
6. You should NOT see admin dashboard

---

## 🎮 Step 6: Create Your First Game (Admin)

1. Login as admin (3jikemuwa@gmail.com)
2. Go to **Dashboard** → **Games**
3. Click **"Create Game"**
4. Fill in:
   - **Game Name**: Test Battle Royale
   - **Description**: A test game
   - **Min Players**: 2
   - **Max Players**: 16
5. Switch to **"Code Editor"** tab
6. The default game code is already there
7. Click **"Save Game"**
8. Game is created in "Draft" status
9. Click the **eye icon** to publish it
10. Go to **Lobby** (user view) - you should see the game

---

## 📱 Step 7: Mobile Access

Your platform works on mobile browsers!

1. On your phone, open browser
2. Go to your Vercel URL
3. Add to home screen for app-like experience:
   - **iOS**: Tap Share → Add to Home Screen
