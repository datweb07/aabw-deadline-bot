# AABW Smart Deadline Tracker & Reminder Bot

An AI-powered contextual timeline and automated deadline tracker designed for **Agentic AI Build Week (AABW) 2026** in Ho Chi Minh City. This tool acts as a proactive, real-time event copilot to eliminate cognitive overload, ensuring builders never miss a workshop, submission deadline, or event perk.

## The Problem & Our Solution

During a high-intensity, 5-day multi-venue hackathon, builders easily get overwhelmed juggling venues, tracking strict submission timelines, and remembering workshop schedules. 

**AABW Smart Deadline Tracker** solves this by offering a self-contained, intelligent dashboard that processes unstructured updates from organizers using GenAI and automatically maps out an optimized schedule for teams.

### Key Features:
- **5-Day Interactive Timeline:** Beautiful Web UI visualizing global buildathon deadlines, partner workshops (Google, NVIDIA, AWS, etc.), and personalized team milestones.
- **AI Schedule Smart-Parsing:** Paste raw text updates or upload screenshots of announcements. The AI uses Structured JSON Outputs to extract events, locations, and timestamps to update the schedule instantly.
- **Dynamic Contextual Agent:** A conversational assistant utilizing LLM function calling. Ask questions naturally (*"What is my next critical deadline?"*, *"Set a dry-run presentation check for my team at 9 PM"*) to manage your schedule on the fly.
- **Proactive Alerts:** Built-in mock notifications that warn users when an important deadline is approaching within 15 minutes.

## Tech Stack

- **Frontend:** React, Next.js (App Router), Tailwind CSS, Lucide Icons, Shadcn/ui
- **Backend:** Node.js (Express) / Next.js API Routes
- **Database:** Local self-contained JSON/SQLite structure (Mock data driven)
- **AI Engine:** Google Gemini API / OpenAI API using Vercel AI SDK (Function calling & JSON mode)

## Project Structure

```text
├── src/
│   ├── app/                # Next.js App Router Pages (Dashboard, Chat, Admin)
│   ├── components/         # UI Elements (Timeline, ChatBot, NotificationTray)
│   ├── lib/                # Shared utilities & SDK initializations
│   └── mock/               # Pre-populated 5-day event data (mockData.json)
├── public/                 # Static assets & sample images for parsing
├── .env.example            # Template for environment variables
└── README.md               # Project documentation