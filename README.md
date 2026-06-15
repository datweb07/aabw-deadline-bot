# AABW Smart Deadline Tracker & Reminder Bot

> **Builder Experience Award — Agentic AI Build Week 2026**
> Jul 8–12, 2026 · Ho Chi Minh City, Vietnam

An AI-powered, production-ready web application that helps hackathon participants stay on top of every workshop, submission cut-off, food window, and team milestone across the 5-day event — with a conversational AI agent, smart schedule parsing, and real-time in-app alerts.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard & Timeline** | Responsive dark-theme timeline showing all 45+ pre-seeded AABW 2026 events grouped by day with a live "NOW" indicator |
| **AI Schedule Parser** | Paste raw text or upload an image (JPEG/PNG/WebP ≤ 10 MB); GPT-4o-mini extracts events with title, date, time, category, and location |
| **Dynamic Chat Agent** | Conversational AI with 4 function-calling tools: query deadlines, get next deadline, create team deadlines, delete team deadlines |
| **Notification System** | Automatic in-app alerts 30 min and 15 min before each deadline; deduped per session; optional Web Push support |
| **Team Deadlines** | Create, edit, and delete personalized team milestones alongside the official schedule |
| **Filter & Search** | Filter timeline by All / Event (global) / Team deadlines |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.17
- **npm** ≥ 9 (or pnpm/yarn)
- An **OpenAI API key** (get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and set your OpenAI API key:

```env
OPENAI_API_KEY=sk-...your-key-here...
AI_MODEL=gpt-4o-mini
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app loads instantly with 45 pre-seeded AABW 2026 events.

### 4. Build for production

```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | — | OpenAI API key |
| `AI_MODEL` | No | `gpt-4o-mini` | LLM model identifier |
| `GEMINI_API_KEY` | No | — | Google Gemini key (if switching providers) |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Base URL for the app |
| `NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL` | No | `30000` | Notification polling interval in ms |

> The AI features gracefully degrade with a descriptive error message if the API key is missing — the dashboard and timeline still work fully.

---

## 🏗 Architecture

```
aabw-smart-deadline-tracker/
├── app/                        # Next.js 14 App Router
│   ├── layout.tsx              # Root layout (Inter font, dark theme, SWR provider)
│   ├── page.tsx                # Home page → DashboardShell
│   ├── globals.css             # Tailwind base + dark theme CSS variables
│   ├── providers.tsx           # SWR global config
│   └── api/
│       ├── deadlines/route.ts          # GET, POST /api/deadlines
│       ├── deadlines/[id]/route.ts     # PUT, DELETE /api/deadlines/:id
│       ├── parse/route.ts              # POST /api/parse (AI smart-parser)
│       └── chat/route.ts              # POST /api/chat (streaming agent)
│
├── components/
│   ├── ui/                     # Shadcn/ui-style base components (Button, Dialog, etc.)
│   ├── dashboard/              # DashboardShell, TimelineView, DayGroup, TimelineItem, etc.
│   ├── deadlines/              # DeadlineModal, ParseUploadModal
│   ├── chat/                   # ChatPanel, ChatMessages, ChatMessage, ChatInput
│   └── notifications/          # AlertTray, NotificationItem, NotificationPoller
│
├── hooks/
│   ├── useDeadlines.ts         # SWR hook for deadline CRUD
│   ├── useChat.ts              # Vercel AI SDK useChat wrapper
│   └── useNotifications.ts     # In-memory notification state + dedup
│
├── lib/
│   ├── types.ts                # All TypeScript interfaces
│   ├── db.ts                   # Lowdb singleton (seeds from mockData.json)
│   └── utils.ts                # Date helpers, category colors, sorting
│
└── data/
    ├── mockData.json           # 45 pre-seeded AABW 2026 events
    └── db.json                 # Runtime database (auto-created, gitignored)
```

### Data Flow

```
Browser → Next.js API Routes → Lowdb (data/db.json)
                           ↓
                    Vercel AI SDK → OpenAI GPT-4o-mini
                           ↓
              Structured output (parser) / Streaming (chat)
```

---

## 🤖 AI Integration

### Schedule Smart-Parser (`POST /api/parse`)

Uses `generateObject` from Vercel AI SDK with a Zod schema to force structured JSON output. The system prompt is AABW-aware (knows the event dates, timezone UTC+7, and valid categories). Returns candidate events for user confirmation — nothing is persisted without explicit confirmation.

### Chat Agent (`POST /api/chat`)

Uses `streamText` with 4 tool definitions:

| Tool | Description |
|---|---|
| `getDeadlines` | Filter deadlines by date, category, type, or upcoming-only |
| `getNextDeadline` | Returns the next upcoming deadline from now |
| `createDeadline` | Creates a team deadline and persists to the database |
| `deleteDeadline` | Deletes a team deadline by ID or partial title match |

Example queries:
- *"What is my next deadline?"*
- *"What workshops are on July 9?"*
- *"Where is the Google Cloud workshop?"*
- *"Add a team deadline: final rehearsal at 8 PM tonight"*
- *"Delete the dry-run deadline"*

---

## 🧪 How It Solves the Builder Experience Problem

During AABW, information overload is real — announcements come via Telegram, Discord, printed schedules, and verbal updates. Teams miss food windows, workshops, and submission deadlines constantly.

This tool solves that by:

1. **Pre-seeding all 45 official AABW 2026 events** so participants have the full schedule on day 1 with zero setup.
2. **AI parsing of new announcements** — when organizers post schedule changes on Telegram, participants paste the message and the AI instantly adds the new events.
3. **Conversational deadline lookup** — no need to scroll through a schedule. Ask "Where is the AWS workshop?" and get an instant answer.
4. **Automatic 15/30-minute alerts** — participants get notified before food windows close and before submission deadlines hit, even if they're deep in a coding session.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + dark theme |
| UI Components | Radix UI primitives + class-variance-authority (shadcn/ui pattern) |
| Icons | Lucide React |
| Database | Lowdb 7 (JSON file, zero config) |
| AI SDK | Vercel AI SDK 3.3 |
| LLM | OpenAI GPT-4o-mini (swappable via env var) |
| Data Fetching | SWR 2.2 |
| Validation | Zod 3.23 |

---

## 📋 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/deadlines` | List all deadlines (sorted by datetime) |
| `POST` | `/api/deadlines` | Create a team deadline |
| `PUT` | `/api/deadlines/:id` | Update a deadline |
| `DELETE` | `/api/deadlines/:id` | Delete a deadline |
| `POST` | `/api/parse` | AI-parse schedule text or image |
| `POST` | `/api/chat` | Streaming chat agent |

---

## 📄 License

MIT — built for AABW 2026 Builder Experience Award.
