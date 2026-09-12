# ⚔️ Life RPG — Gamified Task Progression System

> Transform your daily tasks into an epic RPG questing system. Earn XP, level up attributes, build streak combos, and spend hard-earned gold in the Grand Emporium. Built for **Tech Zephyr 4.0**.

---

## 🌟 Features & Highlights

- **🗡️ Quest Board (Task CRUD):** Inscribe quests categorized by attributes (Strength, Intelligence, Discipline, Vitality). Complete quests for XP and Gold.
- **⚡ Anti-Cheat RPC Engine:** XP, Gold, Level-ups, and Streaks are computed server-side via Supabase PostgreSQL RPC functions (`complete_task`, `purchase_item`), making client-side tampering impossible.
- **✨ Level-Up Celebration:** Screen flash, particle bursts, ascending stats counter, and level progression animations.
- **🛡️ Character Panel & Radar Chart:** Real-time character sheet showing your Level, XP Bar, Gold Treasury, Streaks, and an interactive 4-axis SVG Attribute Radar.
- **🪙 The Grand Emporium (Cosmetic Shop):** Spend earned gold on custom UI themes, prestige titles, and achievement badges.
- **🔥 Streak Tracker:** Automatic streak detection via Postgres triggers on task completion.
- **♿ Accessibility First:** Full keyboard navigation, visible gold focus indicators (`focus-visible:ring-gold`), ARIA labels, high contrast ratios, and skip-to-content links.
- **📶 Offline Resilience:** Real-time offline detection banner with non-blocking error fallbacks.

---

## 🤖 Tools & AI Disclosures (Hackathon Compliance)

In accordance with hackathon rules and guidelines:

- **AI Assistance:** Developed with pair programming assistance from Google DeepMind's Antigravity agentic AI.
- **Custom Architecture:** All UI components, state management hooks, database schemas, Row Level Security (RLS) policies, and anti-cheat RPC functions were designed and customized specifically for this project.
- **Open Source Libraries:** Built using Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Supabase JS client, and Lucide React icons.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build System** | Vite |
| **Styling & Aesthetics** | Tailwind CSS v3 + Custom HSL RPG Design Tokens |
| **Animations** | Framer Motion (Spring dynamics & layout transitions) |
| **Icons** | Lucide React |
| **Backend & DB** | Supabase (PostgreSQL + RLS + Database Triggers) |
| **Auth** | Supabase Built-In Auth (Email/Password) |
| **Deployment Target** | Vercel |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "Life RPG"
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory (based on `.env.example`):
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup (Supabase Migration)
Run the SQL migration script in your Supabase SQL Editor:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy the full contents of [`supabase/migration.sql`](file:///d:/Life%20RPG/supabase/migration.sql).
3. Click **Run** to set up tables (`profiles`, `tasks`, `attributes`, `streaks`, `items`, `inventory`), RLS policies, seeds, and anti-cheat RPC functions.

### 5. Launch Local Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Architecture

```
Life RPG/
├── supabase/
│   └── migration.sql        # Database tables, RLS policies, RPC anti-cheat functions, seed catalog
├── src/
│   ├── components/
│   │   ├── auth/            # LoginForm, SignupForm
│   │   ├── character/       # CharacterPanel, XPBar, AttributeRadar, LevelUpBanner
│   │   ├── layout/          # AppShell, NavButton
│   │   ├── quests/          # QuestList, QuestCard, QuestForm
│   │   ├── shop/            # ItemCard, ShopGrid
│   │   └── ui/              # Button, Input, Card, Modal, Toast, Skeleton, OfflineBanner
│   ├── hooks/
│   │   ├── useAuth.ts       # Supabase authentication hook
│   │   ├── useProfile.ts    # Character data & real-time updates
│   │   ├── useTasks.ts      # Quest management & optimistic complete
│   │   └── useShop.ts       # Emporium catalog & purchase RPC
│   ├── lib/
│   │   ├── supabaseClient.ts # Supabase JS client setup
│   │   └── types.ts         # Shared TypeScript interfaces & types
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main questing view
│   │   ├── Login.tsx        # Atmospheric welcome & auth view
│   │   └── Shop.tsx         # The Grand Emporium view
│   ├── App.tsx              # View state manager, toast provider, offline banner
│   └── index.css            # Dark fantasy color palette, grain overlay, custom scrollbar
└── README.md
```

---

## 🧪 Verification & Build

To test and verify the build locally:

```bash
# Type check TypeScript files
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## 📜 License

MIT License — Built with passion for **Tech Zephyr 4.0**.
