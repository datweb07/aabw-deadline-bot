# Design Document

## Overview

The AABW Smart Deadline Tracker & Reminder Bot is a Next.js 14 App Router application with TypeScript. It is a monorepo-style single project where Next.js API Routes serve as the backend and React Server/Client Components serve as the frontend. Persistence uses **Lowdb** (a zero-config JSON file database) for simplicity and portability. AI features use the **Vercel AI SDK** with OpenAI GPT-4o-mini. The app ships pre-seeded with a comprehensive `mockData.json` covering all five days of AABW 2026.

---

## Architecture

```
aabw-smart-deadline-tracker/
├── .env.example
├── .env.local                  # gitignored, holds API keys
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── data/
│   ├── mockData.json           # Pre-seeded AABW 2026 schedule
│   └── db.json                 # Lowdb runtime database (gitignored)
│
├── lib/
│   ├── db.ts                   # Lowdb singleton + schema types
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── utils.ts                # Date helpers, formatting utilities
│   └── notificationStore.ts   # In-memory issued-notification tracking
│
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, Providers)
│   ├── page.tsx                # Dashboard page (Server Component shell)
│   ├── globals.css             # Tailwind base styles
│   │
│   ├── api/
│   │   ├── deadlines/
│   │   │   ├── route.ts        # GET /api/deadlines, POST /api/deadlines
│   │   │   └── [id]/
│   │   │       └── route.ts    # PUT /api/deadlines/:id, DELETE /api/deadlines/:id
│   │   ├── parse/
│   │   │   └── route.ts        # POST /api/parse — AI schedule smart-parsing
│   │   └── chat/
│   │       └── route.ts        # POST /api/chat — AI chat agent with tool calling
│   │
│   └── providers.tsx           # Client-side context providers
│
├── components/
│   ├── ui/                     # Shadcn/ui base components (Button, Dialog, Badge, etc.)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── toast.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardShell.tsx  # Client shell: data fetching, state, layout
│   │   ├── TimelineView.tsx    # Chronological deadline list
│   │   ├── TimelineItem.tsx    # Single deadline row
│   │   ├── DayGroup.tsx        # Groups deadlines by day
│   │   ├── FilterBar.tsx       # All / Global / Team filter tabs
│   │   └── CurrentTimeLine.tsx # Animated "now" indicator
│   │
│   ├── deadlines/
│   │   ├── DeadlineModal.tsx   # Create/Edit team deadline modal
│   │   └── ParseUploadModal.tsx # AI schedule upload/paste modal with preview
│   │
│   ├── chat/
│   │   ├── ChatPanel.tsx       # Sliding chat panel container
│   │   ├── ChatMessages.tsx    # Scrollable message history
│   │   ├── ChatInput.tsx       # Message input + send button
│   │   └── ChatMessage.tsx     # Individual message bubble
│   │
│   └── notifications/
│       ├── AlertTray.tsx       # Notification tray with badge
│       ├── NotificationItem.tsx
│       └── NotificationPoller.tsx  # Client component: polls + triggers alerts
│
└── hooks/
    ├── useDeadlines.ts         # SWR-based deadline fetching + mutations
    ├── useChat.ts              # Vercel AI SDK useChat hook wrapper
    └── useNotifications.ts    # Notification state management
```

---

## Data Models

### `Deadline` (core entity)

```typescript
interface Deadline {
  id: string;           // UUID v4
  title: string;
  date: string;         // ISO 8601 date string: "2026-07-08"
  time: string;         // 24h time string: "09:00"
  datetime: string;     // ISO 8601 full: "2026-07-08T09:00:00+07:00"
  category: DeadlineCategory;
  location?: string;
  description?: string;
  type: "global" | "team";
  teamName?: string;    // only for type="team"
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}

type DeadlineCategory =
  | "workshop"
  | "submission"
  | "food_perks"
  | "team"
  | "hackathon"
  | "ceremony"
  | "general";
```

### `Notification` (in-memory only)

```typescript
interface AppNotification {
  id: string;
  deadlineId: string;
  deadlineTitle: string;
  proximityWindow: 15 | 30;  // minutes
  triggeredAt: string;        // ISO 8601
  read: boolean;
}
```

### `IssuedKey` (dedup tracking, in-memory)

```typescript
// Key: `${deadlineId}:${proximityWindow}`
type IssuedKey = string;
```

### Lowdb Schema

```typescript
interface DatabaseSchema {
  deadlines: Deadline[];
}
```

The Lowdb database file (`data/db.json`) is seeded from `data/mockData.json` on first run if `deadlines` array is empty.

---

## mockData.json Structure

The mock data file contains an array of 30+ `Deadline` objects covering:

- **Day 1 (Jul 8)**: Opening ceremony, registration, kickoff, AWS workshop, Google workshop, Hackathon start
- **Day 2 (Jul 9)**: Partner deep-dive workshops (MongoDB, Vercel, Anthropic), tech integration sessions, lunch
- **Day 3 (Jul 10)**: Multi-venue workshops, community night, dinner
- **Day 4 (Jul 11)**: Heads-down building, AI night, late-night session, midnight snack window
- **Day 5 (Jul 12)**: Project submission cut-off, Demo Day, judging, awards ceremony

All global deadlines use `type: "global"` and have accurate `datetime` fields in `Asia/Ho_Chi_Minh` timezone (UTC+7).

---

## API Routes

### `GET /api/deadlines`

Returns all deadlines sorted by `datetime` ascending.

**Response:** `{ deadlines: Deadline[] }`

### `POST /api/deadlines`

Creates a new team deadline.

**Request body:**
```typescript
{
  title: string;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:MM"
  category: DeadlineCategory;
  location?: string;
  description?: string;
  teamName?: string;
}
```
**Response:** `{ deadline: Deadline }`

### `PUT /api/deadlines/:id`

Updates an existing deadline (team deadlines only for safety; global deadlines can be updated by admin).

**Request body:** Partial `Deadline` fields (title, date, time, category, location, description).

**Response:** `{ deadline: Deadline }`

### `DELETE /api/deadlines/:id`

Deletes a deadline by ID.

**Response:** `{ success: true }`

### `POST /api/parse`

Accepts a text block or base64-encoded image. Calls the LLM with a structured output schema to extract deadline events. Returns candidate `Deadline[]` for user confirmation — does **not** persist automatically.

**Request body:**
```typescript
{
  type: "text" | "image";
  content: string;    // raw text OR base64 data URL
  mimeType?: string;  // "image/jpeg" | "image/png" | "image/webp"
}
```

**Response:**
```typescript
{
  candidates: Array<{
    title: string;
    date: string;
    time: string;
    category: DeadlineCategory;
    location?: string;
    description?: string;
  }>;
  rawResponse: string;  // LLM explanation summary
}
```

### `POST /api/chat`

Streaming chat endpoint using Vercel AI SDK `streamText`. Accepts conversation history and returns a streaming response with optional tool calls.

**Request body:**
```typescript
{
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}
```

**Response:** Vercel AI SDK streaming response (SSE).

---

## AI Integration Design

### Schedule Smart-Parser (`/api/parse`)

Uses `generateObject` from Vercel AI SDK with a Zod schema to enforce structured output.

**System prompt:**
```
You are an expert schedule parser for the AABW (Agentic AI Build Week) 2026 event in Ho Chi Minh City (July 8-12, 2026). 
Extract ALL events, deadlines, workshops, and time-sensitive activities from the provided input.
For each event, extract: title, date (YYYY-MM-DD), time (HH:MM in 24-hour), category, location, and description.
Categories must be one of: workshop, submission, food_perks, team, hackathon, ceremony, general.
If a year is not specified, assume 2026. If a timezone is not specified, assume UTC+7 (Ho Chi Minh City).
Return only events with deterministic dates and times. Skip vague or undated entries.
```

**Zod schema for structured output:**
```typescript
const ParsedEventSchema = z.object({
  events: z.array(z.object({
    title: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    category: z.enum(["workshop","submission","food_perks","team","hackathon","ceremony","general"]),
    location: z.string().optional(),
    description: z.string().optional(),
  }))
});
```

### Chat Agent (`/api/chat`)

Uses `streamText` from Vercel AI SDK with `tools` map for function calling.

**System prompt:**
```
You are a helpful deadline tracking assistant for AABW 2026 (Agentic AI Build Week, July 8-12, 2026, Ho Chi Minh City).
You have access to the current list of all deadlines and can help participants:
- Find upcoming or past deadlines
- Look up workshop locations and times
- Create new team deadlines
- Delete existing team deadlines
Always be concise and specific. When referencing times, use the local Ho Chi Minh City timezone (UTC+7).
The current datetime is provided in each request context.
```

**Tool definitions (Vercel AI SDK `tool()`):**

```typescript
tools: {
  getDeadlines: tool({
    description: "Get all current deadlines, optionally filtered by date, category, or type",
    parameters: z.object({
      date: z.string().optional(),        // "YYYY-MM-DD"
      category: z.enum([...]).optional(),
      type: z.enum(["global","team"]).optional(),
      upcomingOnly: z.boolean().optional(),
    }),
    execute: async ({ date, category, type, upcomingOnly }) => { ... }
  }),

  createDeadline: tool({
    description: "Create a new team deadline",
    parameters: z.object({
      title: z.string(),
      date: z.string(),   // "YYYY-MM-DD"
      time: z.string(),   // "HH:MM"
      category: z.enum([...]),
      location: z.string().optional(),
      description: z.string().optional(),
      teamName: z.string().optional(),
    }),
    execute: async (params) => { ... }
  }),

  deleteDeadline: tool({
    description: "Delete a team deadline by its ID or title",
    parameters: z.object({
      id: z.string().optional(),
      title: z.string().optional(),
    }),
    execute: async ({ id, title }) => { ... }
  }),

  getNextDeadline: tool({
    description: "Get the single next upcoming deadline from the current time",
    parameters: z.object({}),
    execute: async () => { ... }
  }),
}
```

---

## Notification System Design

The `NotificationPoller` is a Client Component that runs a `setInterval` every 30 seconds. On each tick it:

1. Fetches the current deadline list from `/api/deadlines`.
2. Computes `now = new Date()`.
3. For each deadline, checks if `deadline.datetime` is between `now` and `now + 30min`.
4. If within 30 min and the key `${id}:30` is NOT in the session-scoped `issuedKeys` Set, creates a notification and adds it to the tray. Marks `${id}:30` as issued.
5. If within 15 min and `${id}:15` NOT issued, creates a 15-min notification. Marks `${id}:15` as issued.
6. The `issuedKeys` Set persists in React state for the lifetime of the browser session.
7. Web Push: if `Notification.permission === "granted"`, also fires a `new Notification(...)` browser push.

State is managed via `useNotifications` hook backed by React `useState` + a `useRef` for the issued-keys Set.

---

## Frontend Component Design

### DashboardShell

Client Component. Owns the main state:
- `filter: "all" | "global" | "team"` — controlled by FilterBar
- `deadlines: Deadline[]` — loaded via `useDeadlines` SWR hook
- `chatOpen: boolean` — toggles ChatPanel slide-in

### TimelineView

Receives filtered deadlines. Groups them by date using `DayGroup`. Renders a vertical timeline with a left-side time column and right-side content card. Inserts `CurrentTimeLine` at the appropriate position between past and future items.

### DeadlineModal

Used for both create and edit. Controlled form with Zod-based client-side validation. On submit calls `POST /api/deadlines` or `PUT /api/deadlines/:id`. Uses Shadcn Dialog.

### ParseUploadModal

Two-tab interface: "Paste Text" and "Upload Image". On submit, POSTs to `/api/parse`. Shows a loading skeleton during AI processing. On success, shows a `ParsePreview` list where the user can check/uncheck individual extracted events before confirming. On confirm, POSTs each selected event to `POST /api/deadlines`.

### ChatPanel

Slide-in panel (fixed right side, full height). Uses Vercel AI SDK `useChat` hook pointed at `/api/chat`. Renders `ChatMessages` with auto-scroll to bottom. `ChatInput` with `Enter` to send, `Shift+Enter` for newline.

### AlertTray

Bell icon button in the top navbar with a red badge showing unread count. Clicking opens a popover listing `NotificationItem` components. Each item shows deadline title, time-remaining string, and a dismiss button.

---

## Styling & UI Conventions

- **Color palette**: Dark theme base (`gray-950` background, `gray-900` cards) with accent colors per category:
  - `workshop` → blue
  - `submission` → red
  - `food_perks` → green
  - `team` → purple
  - `hackathon` → orange
  - `ceremony` → yellow
  - `general` → gray
- **Typography**: Inter font via `next/font/google`.
- **Icons**: Lucide React throughout (Calendar, Clock, MapPin, Bell, MessageCircle, Plus, Upload, etc.).
- **Animations**: Tailwind `transition` + `animate-pulse` for the current-time indicator.
- **Responsiveness**: Single-column timeline on mobile; two-column (timeline + chat) on `lg:` breakpoints.
