# Multi-Platform Deployment Guide
## Render + Supabase + Firebase + Vercel + Netlify

This guide shows you how to deploy El Dorado across all platforms optimally.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────┐                   ┌───▼────┐
│ Vercel │                   │Netlify │
│Frontend│                   │ Docs   │
└───┬────┘                   └───┬────┘
    │                            │
    └──────┬─────────────────────┘
           │
    ┌──────▼──────┐
    │  Firebase   │
    │    Auth     │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────┐
    │       Supabase               │
    │  (Central Database)          │
    │  • PostgreSQL                │
    │  • Realtime                  │
    │  • Storage                   │
    └──────┬──────────────────────┘
           │
    ┌──────▼──────┐
    │   Render    │
    │  Backend    │
    │  • API      │
    │  • WebSocket│
    │  • Cron Jobs│
    └─────────────┘
```

---

## 📋 Platform Roles

| Platform | Purpose | What It Hosts |
|----------|---------|---------------|
| **Vercel** | Main Frontend | Next.js app, UI, game interface |
| **Netlify** | Marketing & Docs | Landing page, documentation, staging |
| **Render** | Backend Logic | API server, WebSocket, cron jobs |
| **Supabase** | Central Database | PostgreSQL, auth, real-time, storage |
| **Firebase** | Auth & Analytics | Google login, analytics, messaging |

---

## 🚀 Step-by-Step Deployment

### **STEP 1: Upload to GitHub (All Files)**

1. Go to: https://github.com/3jikeanekwe/3l-Dorado
2. Upload ALL 56 files (use FILE_UPLOAD_CHECKLIST.md)
3. Verify folder structure matches this:

```
3l-Dorado/
├── app/              # Frontend (Vercel/Netlify)
├── backend/          # Backend (Render)
├── lib/
│   ├── firebase/     # Firebase integration
│   ├── supabase/     # Supabase integration
│   └── game-engine/  # Game engine
├── vercel.json       # Vercel config
├── netlify.toml      # Netlify config
├── render.yaml       # Render config
├── firebase.json     # Firebase config
└── deployment-config.json
```

---

### **STEP 2: Setup Supabase (Central Database)**

#### 2.1 Create Project
1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in:
   - Name: `el-dorado-platform`
   - Database Password: (create strong password)
   - Region: (closest to you)
4. Wait 2-3 minutes

#### 2.2 Run Database Migrations
1. Click "SQL Editor"
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_functions.sql`
4. Verify tables exist

#### 2.3 Get Credentials
- Settings → API
- Copy:
  - `Project URL`
  - `anon public key`
  - `service_role key` (KEEP SECRET!)

---

### **STEP 3: Setup Firebase (Authentication)**

#### 3.1 Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name: `el-dorado-gaming`
4. Enable Google Analytics (optional)

#### 3.2 Enable Authentication
1. Authentication → Get Started
2. Enable:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Phone (optional)

#### 3.3 Get Firebase Config
1. Project Settings → General
2. Scroll to "Your apps"
3. Click "Web app" (</>) icon
4
