"use client";
import React, { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { Message } from "ai/react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center overflow-y-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/20">
          <Bot className="h-7 w-7 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-300 mb-1">Ask me anything</p>
          <p className="text-xs text-gray-500">Try these:</p>
        </div>
        <div className="space-y-2 w-full max-w-xs">
          {[
            "What is my next deadline?",
            "What workshops are on July 9?",
            "Where is the Google workshop?",
            "Add a team deadline for dry-run at 9 PM tonight",
          ].map((suggestion) => (
            <div
              key={suggestion}
              className="rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-gray-400 text-left"
            >
              &ldquo;{suggestion}&rdquo;
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex gap-2 items-start">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shrink-0 mt-0.5">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-800 px-4 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
