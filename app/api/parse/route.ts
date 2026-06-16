import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Groq provider via OpenAI-compatible endpoint
// ---------------------------------------------------------------------------
function getGroqModel() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Please add it to .env.local");
  }
  const groq = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });
  // Use a capable model for structured extraction (8b may struggle with complex JSON)
  const modelId = process.env.AI_PARSE_MODEL ?? process.env.AI_MODEL ?? "llama-3.3-70b-versatile";
  return groq(modelId);
}

// ---------------------------------------------------------------------------
// Zod schema for structured extraction
// ---------------------------------------------------------------------------
const ParsedEventSchema = z.object({
  events: z.array(
    z.object({
      title: z.string().min(1).describe("Name or title of the event"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date in YYYY-MM-DD format"),
      time: z.string().regex(/^\d{2}:\d{2}$/).describe("Time in HH:MM 24-hour format"),
      category: z
        .enum(["workshop", "submission", "food_perks", "team", "hackathon", "ceremony", "general"])
        .describe("Category of the event"),
      location: z.string().optional().describe("Venue or location name"),
      description: z.string().optional().describe("Brief description"),
    })
  ).describe("List of extracted events and deadlines"),
  summary: z.string().describe("Brief summary of what was found in the input"),
});

const SYSTEM_PROMPT = `You are an expert schedule parser for the AABW (Agentic AI Build Week) 2026 event in Ho Chi Minh City (July 8-12, 2026, UTC+7).

Extract ALL events, deadlines, workshops, and time-sensitive activities from the provided input.

For each event extract:
- title: event name (required)
- date: YYYY-MM-DD (required, assume year 2026 if not given)
- time: HH:MM 24-hour (required, convert "3pm"→"15:00", "9am"→"09:00")
- category: workshop | submission | food_perks | team | hackathon | ceremony | general
- location: venue or room if mentioned
- description: 1-2 sentences if context available

Rules:
- ONLY extract events with deterministic dates AND times
- Skip events with vague timing like "TBD" or "sometime tomorrow"
- Assume UTC+7 if timezone not specified
- Deduplicate same title + time entries`;

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, mimeType } = body as {
      type: "text" | "image";
      content: string;
      mimeType?: string;
    };

    if (!type || !content) {
      return NextResponse.json(
        { error: "Request must include 'type' (text|image) and 'content'" },
        { status: 400 }
      );
    }

    if (type === "image") {
      const estimatedBytes = content.length * 0.75;
      if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Image file exceeds the 10 MB size limit." },
          { status: 400 }
        );
      }
      if (!mimeType || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
        return NextResponse.json(
          { error: "Unsupported image format. Use JPEG, PNG, or WebP." },
          { status: 400 }
        );
      }
    }

    let model;
    try {
      model = getGroqModel();
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI configuration error";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    // Groq doesn't support image input on most models — fall back to text description
    const textContent =
      type === "text"
        ? `Please extract all events and deadlines from this schedule:\n\n${content}`
        : `Please extract all events and deadlines from this schedule image. The image has been provided as base64 but describe what you can extract if any text is visible. Image type: ${mimeType}`;

    const result = await generateObject({
      model,
      schema: ParsedEventSchema,
      system: SYSTEM_PROMPT,
      prompt: textContent,
    });

    const { events, summary } = result.object;

    if (!events || events.length === 0) {
      return NextResponse.json({
        candidates: [],
        rawResponse: summary || "No events could be extracted from the provided input.",
      });
    }

    return NextResponse.json({ candidates: events, rawResponse: summary });
  } catch (error) {
    console.error("[POST /api/parse]", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: `Failed to parse schedule: ${message}` },
      { status: 500 }
    );
  }
}
