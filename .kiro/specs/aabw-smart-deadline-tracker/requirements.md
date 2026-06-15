# Requirements Document

## Introduction

The **AABW Smart Deadline Tracker & Reminder Bot** is a production-ready, self-contained AI-powered web application built for the Agentic AI Build Week 2026 (July 8–12, Ho Chi Minh City). It helps event participants track global event deadlines (workshops, submission cut-offs, food/perk claim windows) and manage personalized team deadlines across the 5-day event timeline.

The application combines a responsive dashboard with a dynamic AI chat agent, LLM-powered schedule parsing from images or raw text, and a built-in notification simulation system. It is built on Next.js App Router, TypeScript, Tailwind CSS, Shadcn/ui, Lucide React, a lightweight database (SQLite, Lowdb, or in-memory JSON), and the Vercel AI SDK with OpenAI GPT-4o/mini or Google Gemini as the LLM backend.

---

## Glossary

- **Deadline**: A named event with a scheduled date/time, category, and optional location that participants must be aware of or act upon.
- **Global Deadline**: An organizer-defined deadline visible to all participants (e.g., workshop start times, submission cut-offs, food claim windows).
- **Team Deadline**: A participant-created deadline scoped to a specific team (e.g., dry-run rehearsal, internal review).
- **Timeline**: The chronologically ordered list of all deadlines displayed on the dashboard.
- **Notification**: An in-app urgent alert triggered automatically when a deadline falls within a configured proximity window.
- **Alert Tray**: The UI component displaying pending and recent notifications.
- **AI Parser**: The LLM-powered component that extracts structured deadline data from raw text or image input.
- **Chat Agent**: The LLM-powered conversational interface that answers deadline-related questions and executes deadline management actions via function calling.
- **Schedule Upload**: The user action of providing an image or pasted text containing event schedule information for AI parsing.
- **Mock Data**: Pre-seeded deadline data covering the full AABW 2026 event (July 8–12) used to populate the application on first run.
- **Proximity Window**: A configurable time interval (15 or 30 minutes) before a deadline at which a notification is triggered.
- **System**: The AABW Smart Deadline Tracker & Reminder Bot application as a whole.
- **Dashboard**: The primary web UI screen showing the timeline and key deadline information.
- **Parser**: The AI Schedule Smart-Parsing subsystem.
- **Agent**: The Dynamic Chat Agent subsystem.
- **Notifier**: The Notification Simulation subsystem.
- **Store**: The data persistence layer (SQLite, Lowdb, or in-memory JSON).

---

## Requirements

---

### Requirement 1: Dashboard and Timeline Visualizer

**User Story:** As an event participant, I want to see all global and team deadlines in a clear timeline view, so that I can understand what is coming up and plan my time accordingly.

#### Acceptance Criteria

1. THE Dashboard SHALL display all Global Deadlines and Team Deadlines in chronological order on a single timeline view.
2. THE Dashboard SHALL render correctly on desktop viewports (≥ 1024px wide) and mobile viewports (< 768px wide) without horizontal overflow.
3. WHEN the Dashboard loads, THE Dashboard SHALL display the current date and time and visually highlight the next upcoming Deadline within the timeline.
4. THE Dashboard SHALL categorize and visually distinguish Deadlines by type, including at minimum: Workshop, Submission, Food/Perks, Team, and General.
5. THE Dashboard SHALL display for each Deadline: the title, date, time, category, and location (when available).
6. WHEN a Deadline has passed, THE Dashboard SHALL visually differentiate it from future Deadlines (e.g., greyed out or marked as past).
7. THE Dashboard SHALL include an Alert Tray component that displays pending and recent Notifications.
8. THE Store SHALL be pre-seeded with Mock Data covering all five days of AABW 2026 (July 8–12), including Registration, Kickoff, Partner Workshops, Hackathon sessions, Submission cut-offs, Demo Day, Judging, and Awards Ceremony events.

---

### Requirement 2: Team Deadline Management

**User Story:** As a team member, I want to create, edit, and delete personalized team deadlines, so that my team can track internal milestones alongside the official event schedule.

#### Acceptance Criteria

1. THE System SHALL provide a form or modal interface for participants to create a new Team Deadline with at minimum: title, date, time, category, and optional location fields.
2. WHEN a participant submits a valid new Team Deadline form, THE Store SHALL persist the Team Deadline and THE Dashboard SHALL display it on the Timeline within 1 second.
3. WHEN a participant submits a Team Deadline form with a missing required field (title, date, or time), THE System SHALL display an inline validation error message identifying the missing field and SHALL NOT persist the incomplete record.
4. THE System SHALL allow participants to edit an existing Team Deadline's title, date, time, category, and location.
5. WHEN a participant confirms deletion of a Team Deadline, THE Store SHALL remove the record and THE Dashboard SHALL remove it from the Timeline within 1 second.
6. THE System SHALL allow participants to filter the Timeline to show all Deadlines, Global Deadlines only, or Team Deadlines only.

---

### Requirement 3: AI Schedule Smart-Parsing

**User Story:** As an event participant, I want to upload a schedule image or paste raw schedule text so that the AI can automatically extract and add deadlines to my timeline without manual data entry.

#### Acceptance Criteria

1. THE System SHALL provide a Schedule Upload interface that accepts either a pasted plain-text block or an uploaded image file (JPEG, PNG, or WebP, maximum 10 MB).
2. WHEN a participant submits a Schedule Upload, THE Parser SHALL send the input to the configured LLM (OpenAI GPT-4o/mini or Google Gemini via Vercel AI SDK) and request structured extraction of all identifiable events.
3. WHEN the LLM returns a structured response, THE Parser SHALL extract for each identified event: title, date, time, category, and location (where present), and produce a list of candidate Deadline objects.
4. WHEN the Parser produces one or more candidate Deadline objects, THE System SHALL display a confirmation preview listing all extracted Deadlines before persisting them.
5. WHEN a participant confirms the extracted Deadlines, THE Store SHALL persist them as Global Deadlines and THE Dashboard SHALL reflect them on the Timeline within 1 second.
6. WHEN a participant rejects or dismisses the confirmation preview, THE Store SHALL NOT persist any extracted Deadlines.
7. IF the LLM returns no identifiable events from the Schedule Upload input, THEN THE Parser SHALL display a descriptive message informing the participant that no events could be extracted and SHALL NOT modify the Store.
8. IF the Schedule Upload image file exceeds 10 MB, THEN THE System SHALL display an error message stating the file size limit and SHALL NOT send the file to the LLM.
9. IF the LLM API call fails or returns an error response, THEN THE Parser SHALL display a descriptive error message and SHALL NOT modify the Store.
10. THE Pretty_Printer SHALL serialize any persisted Deadline object back into a human-readable text format suitable for display or export.
11. FOR ALL valid Deadline objects produced by the Parser, parsing the Pretty_Printer output of a Deadline through the Parser SHALL produce a Deadline object with equivalent title, date, time, category, and location fields (round-trip property).

---

### Requirement 4: Dynamic Chat Agent

**User Story:** As an event participant, I want to interact with a chat interface to ask questions about deadlines and create or manage team deadlines using natural language, so that I can stay informed and take actions without navigating menus.

#### Acceptance Criteria

1. THE System SHALL provide a Chat Agent interface where participants can type natural language messages and receive responses.
2. WHEN a participant sends a message, THE Agent SHALL send the message along with the current list of Deadlines as context to the configured LLM and return a response within 10 seconds under normal network conditions.
3. WHEN a participant asks "What is my next deadline?" or a semantically equivalent question, THE Agent SHALL respond with the title, time, and category of the soonest upcoming Deadline relative to the current time.
4. WHEN a participant asks for deadlines on a specific date (e.g., "What deadlines are on July 10?"), THE Agent SHALL respond with all Deadlines scheduled on that date.
5. WHEN a participant requests creation of a Team Deadline via natural language (e.g., "Set a team deadline for final presentation dry-run at 9 PM tonight"), THE Agent SHALL invoke the create-deadline tool via LLM function calling, persist the new Team Deadline to the Store, and confirm the creation to the participant in the chat response.
6. WHEN a participant requests deletion of a Team Deadline via natural language, THE Agent SHALL invoke the delete-deadline tool via LLM function calling, remove the record from the Store, and confirm the deletion in the chat response.
7. IF the Agent cannot determine a clear intent from the participant's message, THEN THE Agent SHALL respond with a clarifying question or a description of supported actions.
8. IF the LLM API call for a chat message fails, THEN THE Agent SHALL display a descriptive error message in the chat interface and SHALL NOT modify the Store.
9. THE Agent SHALL maintain conversation history within a single session so that follow-up questions reference prior messages correctly.

---

### Requirement 5: Notification Simulation

**User Story:** As an event participant, I want to receive automatic in-app alerts when a deadline is approaching, so that I am reminded in time to act without having to check the dashboard constantly.

#### Acceptance Criteria

1. THE Notifier SHALL poll the Store at an interval not exceeding 60 seconds to check for upcoming Deadlines.
2. WHEN a Deadline is within 30 minutes of the current time and no 30-minute Notification for that Deadline has been issued in the current session, THE Notifier SHALL create a Notification and add it to the Alert Tray.
3. WHEN a Deadline is within 15 minutes of the current time and no 15-minute Notification for that Deadline has been issued in the current session, THE Notifier SHALL create a Notification and add it to the Alert Tray.
4. THE Notifier SHALL display each Notification in the Alert Tray with: the Deadline title, the time remaining until the Deadline, and the Proximity Window label ("30 min" or "15 min").
5. WHEN a Notification is added to the Alert Tray, THE Dashboard SHALL visually indicate the presence of a new unread Notification (e.g., a badge count on the Alert Tray icon).
6. WHEN a participant dismisses a Notification from the Alert Tray, THE Notifier SHALL mark it as read and THE Alert Tray SHALL remove it from the pending view.
7. THE Notifier SHALL NOT issue duplicate Notifications for the same Deadline and the same Proximity Window within a single session.
8. WHERE web push notification support is available in the participant's browser and the participant has granted permission, THE Notifier SHALL additionally send a web push Notification for each triggered alert.

---

### Requirement 6: Application Configuration and LLM Integration

**User Story:** As a developer deploying the application, I want to configure LLM provider credentials and application settings via environment variables, so that the application runs correctly in any deployment environment without code changes.

#### Acceptance Criteria

1. THE System SHALL read the LLM provider API key from an environment variable (`OPENAI_API_KEY` or `GEMINI_API_KEY`) and SHALL NOT hardcode API keys in source code.
2. THE System SHALL read the active LLM model identifier from an environment variable (`AI_MODEL`) with a documented default value of `gpt-4o-mini`.
3. IF a required environment variable is missing at application startup, THEN THE System SHALL log a descriptive error message identifying the missing variable and SHALL prevent LLM-dependent features from executing until the variable is provided.
4. THE System SHALL expose all LLM calls through the Vercel AI SDK abstraction layer so that switching between OpenAI and Gemini requires only an environment variable change.
5. THE System SHALL include a `.env.example` file listing all required and optional environment variables with descriptions.
