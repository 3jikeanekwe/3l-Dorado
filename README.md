# El Dorado Gaming Platform

A competitive multiplayer gaming platform with real-money betting using USDC. Features session-based matchmaking, Roblox-style game creation tools, and comprehensive admin controls.

## 🎮 Features

### For Players
- **Multiple Game Modes**: Battle Royale, Racing, Combat Arenas, Mini-Games
- **Real Money Betting**: Place bets with USDC across multiple tiers ($0.25, $0.50, $1, $3, $5)
- **Session-Based Matchmaking**: Join ongoing matches instantly
- **Progression System**: Level up, earn XP, unlock rewards
- **Live Leaderboards**: Track your performance against other players

### For Admins
- **Game Builder**: Roblox/Unity-style game creation with drag-and-drop + code editor
- **Asset Management**: Upload sprites, sounds, and game assets
- **Session Control**: Manage active games, monitor players
- **User Management**: Invite other admins, manage player accounts
- **Revenue Dashboard**: Track platform earnings and analytics

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime, WebSockets
- **Authentication**: Supabase Auth
- **Payments**: USDC (to be integrated)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)
- Git installed

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/3jikeanekwe/3l-Dorado.git
cd 3l-Dorado
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project:
   - Name: `el-dorado-platform`
   - Choose a database password (save it!)
   - Select your region
   - Wait 2-3 minutes for setup

3. Get your credentials:
   - Go to **Settings** → **API**
   - Copy **Project URL** and **anon/public key**

4. Setup database schema:
   - Go to **SQL Editor**
   - Click **New Query**
   - Copy and paste the entire SQL from `supabase/migrations/001_initial_schema.sql`
   - Click **Run**

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAIL=3jikemuwa@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your Admin Account

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Sign up with email: **3jikemuwa@gmail.com**
3. You'll automatically be assigned admin role
4. Login and access the admin dashboard at `/dashboard`

## 🌐 Deployment to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [https://vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository: `3jikeanekwe/3l-Dorado`
5. Configure environment variables:
   - Add all variables from `.env.local`
   - Click **"Add"** for each variable
6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Post-Deployment Steps

1. Update Supabase settings:
   - Go to **Authentication** → **URL Configuration**
   - Add your Vercel domain to **Site URL** and **Redirect URLs**
   - Example: `https://your-app.vercel.app`

2. Update `.env.local` on Vercel:
   - Go to your project settings
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

## 📁 Project Structure

```
3l-Dorado/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (admin)/             # Admin dashboard
│   │   ├── dashboard/
│   │   ├── games/
│   │   └── invites/
│   ├── (user)/              # User pages
│   │   ├── lobby/
│   │   └── profile/
│   ├── api/                 # API routes
│   └── layout.tsx
├── components/              # React components
│   ├── admin/
│   ├── game/
│   └── ui/
├── lib/                     # Utilities
│   ├── supabase/           # Supabase client
│   ├── hooks/
│   └── utils/
├── types/                   # TypeScript types
│   └── database.types.ts
├── public/                  # Static assets
└── supabase/               # Supabase migrations
```

## 🗄️ Database Schema

### Tables

- **profiles**: User accounts with roles (user/admin)
- **admin_invites**: Email invitations for admin access
- **games**: Created games by admins
- **game_sessions**: Active and waiting game sessions
- **session_participants**: Players in each session
- **transactions**: USDC deposits, bets, and prizes

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on signup
- Admin role assignment via email invites
- Real-time subscriptions for live updates

## 🔐 Security

- All routes protected with middleware
- Role-based access control (RBAC)
- Supabase Row Level Security (RLS)
- Environment variables for sensitive data
- HTTPS enforced on production

## 🎨 Customization

### Adding New Games (Admin)

1. Login as admin
2. Go to **Dashboard** → **Games**
3. Click **"Create New Game"**
4. Use the game builder to:
   - Add sprites and assets
   - Configure physics
   - Write game logic
   - Set player slots and betting tiers

### Inviting New Admins

1. Go to **Dashboard** → **Invites**
2. Enter email address
3. User will be automatically assigned admin role on signup

## 💰 USDC Integration (Coming Soon)

Phase 2 will include:
- Circle API integration for USDC deposits/withdrawals
- KYC verification flow
- Wallet connection
- Transaction history

## 📞 Support

- **Email**: 3jikemuwa@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/3jikeanekwe/3l-Dorado/issues)

## 📄 License

Proprietary - All rights reserved

## 🚧 Development Roadmap

### Phase 1 (Complete)
✅ Project setup
✅ Authentication system
✅ Admin dashboard foundation
✅ User lobby
✅ Database schema

### Phase 2 (In Progress)
🔄 Game builder interface
🔄 Asset management system
🔄 USDC payment integration
🔄 Session management

### Phase 3 (Planned)
⏳ Game engine core
⏳ Multiplayer synchronization
⏳ Physics integration
⏳ Mobile optimization

### Phase 4 (Planned)
⏳ Game marketplace
⏳ Social features
⏳ Advanced analytics
⏳ Performance optimization

## 🤝 Contributing

This is a private project. Contact the owner for collaboration opportunities.

---

Built with ❤️ for competitive gaming enthusiasts
