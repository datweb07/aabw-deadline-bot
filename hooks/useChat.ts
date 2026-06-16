"use client";
import { useChat as useAiChat } from "ai/react";

/**
 * Wrapper around Vercel AI SDK's useChat.
 * streamMode "text" because the route returns plain text (not AI SDK data stream).
 * This works because we use generateText server-side and stream the result as plain text.
 */
export function useChat() {
  return useAiChat({
    api: "/api/chat",
    streamMode: "text",
    onError: (error) => {
      console.error("[Chat error]", error);
    },
  });
}
