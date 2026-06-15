"use client";
import React from "react";
import { X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } =
    useChat();

  const handleClear = () => setMessages([]);

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-sm lg:max-w-none lg:w-96 z-40",
          "flex flex-col border-l border-gray-800 bg-gray-950 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-100">AABW Assistant</p>
              <p className="text-xs text-gray-500">Ask about deadlines or add team tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div className="px-4 py-2 text-xs text-red-400 bg-red-500/10 border-t border-red-500/20 shrink-0">
            {error.message}
          </div>
        )}

        {/* Input */}
        <ChatInput
          input={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </aside>
    </>
  );
}
