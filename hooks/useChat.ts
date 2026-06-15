"use client";
import { useChat as useAiChat } from "ai/react";

/**
 * Thin wrapper around Vercel AI SDK's useChat, pointing at /api/chat.
 * Re-exports all standard useChat fields so consumers don't need to import from ai/react directly.
 */
export function useChat() {
  return useAiChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("[Chat error]", error);
    },
  });
}
