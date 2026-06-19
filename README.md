# AABW Smart Deadline Tracker & Reminder Bot

> **Builder Experience Award - Agentic AI Build Week 2026**
> Jul 8–12, 2026 · Ho Chi Minh City, Vietnam

An AI-powered web application that helps hackathon participants stay on top of every workshop, submission cut-off, food window, and team milestone across the 5-day AABW 2026 event — powered by **Groq** (ultra-fast LLM inference), a conversational AI agent with tool calling, smart schedule parsing, real-time in-app alerts, and **Supabase** for persistent storage.

## Features

| Feature | Description |
|---|---|
| **Dashboard & Timeline** | Responsive timeline grouped by day with a live **NOW** indicator, collapsible day sections, and expand/collapse all |
| **Stats Overview** | Cards for current hackathon day (1–5), upcoming event count, next deadline countdown, and total events |
| **Final Submission Countdown** | Flip-clock countdown to the Jul 12, 09:00 (UTC+7) submission deadline, responsive across screen sizes |
| **Search & Category Filter** | Full-text search on title/description; click a category badge to filter the timeline |
| **Filter Tabs** | Switch between All / Event (global) / Team deadline views with live counts |
| **AI Schedule Parser** | Paste text or upload a schedule image (JPEG/PNG/WebP) — Groq extracts events via structured output; review before saving |
| **AI Chat Agent** | Ask questions in natural language; the agent calls tools to query deadlines, get the next upcoming item, create or delete team deadlines |
| **Smart Notifications** | Automatic in-app alerts 30 min and 15 min before each deadline, deduped per session, persisted dismissals via `localStorage`, optional browser Web Push |
| **Team Deadlines** | Create, edit, and delete personalized team milestones alongside the official schedule |
| **Google Calendar Export** | One-click "Add to Calendar" link on each upcoming event |
| **Responsive Layout** | Collapsible sidebar, slide-in AI chat panel, mobile-friendly navbar and floating action buttons |

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.17
- **npm** ≥ 9
- A free **Groq API key** — [console.groq.com/keys](https://console.groq.com/keys) (no credit card needed)
- A **Supabase** project — [supabase.com](https://supabase.com) (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set your keys:

```env
GROQ_API_KEY=gsk_your_key_here
AI_MODEL=llama-3.1-8b-instant

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set up Supabase database

In the Supabase SQL Editor, run:

```sql
CREATE TABLE IF NOT EXISTS public.deadlines (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  datetime TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  description TEXT,
  type TEXT NOT NULL,
  "teamName" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.deadlines DISABLE ROW LEVEL SECURITY;
```

Seed the official AABW 2026 schedule (45 events) by importing `data/mockData.json` into the `deadlines` table via the Supabase Table Editor or a one-time insert script.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | — | Groq API key from console.groq.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anonymous/public API key |
| `AI_MODEL` | No | `llama-3.1-8b-instant` | Chat model ID |
| `AI_PARSE_MODEL` | No | same as `AI_MODEL` | Model for schedule parsing (use `llama-3.3-70b-versatile` for better accuracy) |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Base URL |
| `NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL` | No | `30000` | Notification polling interval in ms |

> If `GROQ_API_KEY` is missing, AI features return a descriptive error. The dashboard and timeline still work when Supabase is configured.

## Project Structure

```
aabw-deadline-bot/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts              # POST /api/chat — Groq agent with tools
│   │   ├── deadlines/
│   │   │   ├── route.ts              # GET + POST /api/deadlines
│   │   │   └── [id]/
│   │   │       └── route.ts          # PUT + DELETE /api/deadlines/:id
│   │   └── parse/
│   │       └── route.ts              # POST /api/parse — AI schedule parser (text + image)
│   ├── globals.css                   # Tailwind base + theme variables
│   ├── layout.tsx                    # Root layout (Inter font, metadata)
│   ├── page.tsx                      # Home → DashboardShell
│   └── providers.tsx                 # SWR global config
│
├── components/
│   ├── chat/
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatMessages.tsx
│   │   └── ChatPanel.tsx
│   ├── dashboard/
│   │   ├── CurrentTimeLine.tsx       # Live "NOW" indicator on timeline
│   │   ├── DashboardShell.tsx        # Main layout shell
│   │   ├── DayGroup.tsx              # Collapsible day section
│   │   ├── FilterBar.tsx             # Tabs, search, category filter
│   │   ├── TimelineItem.tsx          # Single event card + Google Calendar link
│   │   └── TimelineView.tsx          # Grouped timeline with expand/collapse
│   ├── deadlines/
│   │   ├── DeadlineModal.tsx         # Create / edit team deadline
│   │   ├── FlipTimer.tsx             # Custom flip-card countdown (standalone)
│   │   └── ParseUploadModal.tsx      # AI parse from text or image
│   ├── notifications/
│   │   ├── AlertTray.tsx             # Bell icon + notification popover
│   │   ├── NotificationItem.tsx
│   │   └── NotificationPoller.tsx    # Background 15/30-min alert checker
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── toast.tsx
│
├── data/
│   └── mockData.json                 # 45 pre-seeded AABW 2026 events (import into Supabase)
│
├── hooks/
│   ├── useChat.ts                    # useChat wrapper (streamMode="text" for Groq)
│   ├── useDeadlines.ts               # SWR hook with CRUD mutations
│   └── useNotifications.ts           # Notification state + session/localStorage dedup
│
├── lib/
│   ├── db.ts                         # Supabase client + CRUD helpers
│   ├── types.ts                      # TypeScript interfaces and API types
│   └── utils.ts                      # Date helpers, category colors, sorting, grouping
│
├── public/
│   └── assets/
│       └── images/
│           ├── favicon/
│           │   ├── favicon.png
│           │   ├── favicon-1.png
│           │   └── favicon-2.png
│           └── header/
│               ├── full_width.png    # Sponsor banner
│               └── og-image.png      # App logo
│
├── .env.example                      # Environment variable template
├── .gitignore
├── .vscode/
│   └── settings.json
├── .kiro/
│   └── specs/
│       └── aabw-smart-deadline-tracker/
│           ├── .config.kiro
│           ├── design.md
│           ├── requirements.md
│           └── tasks.md
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## AI Integration (Groq)

The app uses **Groq** as the AI backend via its OpenAI-compatible API (`https://api.groq.com/openai/v1`), accessed through `@ai-sdk/openai`'s `createOpenAI` with a custom `baseURL`. This avoids streaming format incompatibilities of `@ai-sdk/groq` with `ai@3.3.x`.

### Chat Agent (`POST /api/chat`)

Uses `generateText` (not streaming) with `maxToolRoundtrips: 5` to fully resolve tool calls server-side, then streams the final text response as plain chunks. Client uses `streamMode: "text"`.

**4 tools available to the agent:**

| Tool | Description |
|---|---|
| `getDeadlines` | Filter by date, category, type, upcomingOnly |
| `getNextDeadline` | Returns the next deadline from now |
| `createDeadline` | Creates a team deadline, persists to Supabase |
| `deleteDeadline` | Deletes by ID or partial title match (team only) |

**Example queries:**

```
"What is my next deadline?"
"What workshops are on July 9?"
"Where is the AWS workshop?"
"Add a team deadline: dry run at 9 PM tonight"
"Delete the dry run deadline"
```

### Schedule Parser (`POST /api/parse`)

Uses `generateObject` with a Zod schema for structured extraction. Accepts `type: "text"` or `type: "image"` (base64 + mimeType). Recommended model: `llama-3.3-70b-versatile` via `AI_PARSE_MODEL`. Returns candidate events for user confirmation — nothing is auto-persisted.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/deadlines` | List all deadlines, sorted by datetime |
| `POST` | `/api/deadlines` | Create a team deadline |
| `PUT` | `/api/deadlines/:id` | Update a deadline |
| `DELETE` | `/api/deadlines/:id` | Delete a deadline |
| `POST` | `/api/parse` | AI-parse schedule from text or image |
| `POST` | `/api/chat` | Groq chat agent (plain text stream) |

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 14.2.5 |
| Language | TypeScript | 5.5.3 |
| Styling | Tailwind CSS | 3.4.6 |
| UI Components | Radix UI + class-variance-authority | — |
| Icons | Lucide React | 0.414.0 |
| Database | Supabase (PostgreSQL) | 2.x |
| AI SDK | Vercel AI SDK | 3.3.15 |
| AI Provider | Groq (via OpenAI-compat endpoint) | — |
| LLM | llama-3.1-8b-instant (default) | — |
| Data Fetching | SWR | 2.2.5 |
| Validation | Zod | 3.23.8 |
| Date Utilities | date-fns | 3.6.0 |
| Countdown UI | @leenguyen/react-flip-clock-countdown | 1.7.x |

## Why Groq?

- **Free tier** — perfect for hackathon demos, no credit card required
- **Ultra-fast inference** — ~100ms response time, even with tool calls
- **OpenAI-compatible API** — drop-in with `createOpenAI({ baseURL: "https://api.groq.com/openai/v1" })`
- **LLaMA 3.1 8B** supports function calling, adequate for deadline queries

## How It Solves the Builder Experience Problem

During AABW, information overload is constant — announcements hit Telegram, Discord, printed schedules, and verbal updates. Teams regularly miss food windows, workshops, and submission deadlines while deep in coding sessions.

This tool addresses that by:

1. **Pre-seeding 45 official events** — participants have the full schedule on Day 1 after Supabase import
2. **AI parsing new announcements** — paste a Telegram message or upload a schedule screenshot; AI extracts events for review
3. **Conversational lookup** — ask "Where is the MongoDB workshop?" instead of scrolling a PDF
4. **Automatic 15/30-minute alerts** — never miss a food window or submission deadline again
5. **Flip-clock submission countdown** — always visible reminder of the final Jul 12 deadline
