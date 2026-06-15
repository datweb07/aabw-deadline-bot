"use client";
import React, { useState, useCallback } from "react";
import { Bot, Plus, Upload, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterBar from "./FilterBar";
import TimelineView from "./TimelineView";
import DeadlineModal from "@/components/deadlines/DeadlineModal";
import ParseUploadModal from "@/components/deadlines/ParseUploadModal";
import ChatPanel from "@/components/chat/ChatPanel";
import AlertTray from "@/components/notifications/AlertTray";
import NotificationPoller from "@/components/notifications/NotificationPoller";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useNotifications } from "@/hooks/useNotifications";
import type { Deadline, TimelineFilter } from "@/lib/types";

export default function DashboardShell() {
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [chatOpen, setChatOpen] = useState(false);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  const { deadlines, isLoading, mutate } = useDeadlines();
  const { notifications, addNotification, dismissNotification } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredDeadlines = React.useMemo(() => {
    if (!deadlines) return [];
    if (filter === "global") return deadlines.filter((d) => d.type === "global");
    if (filter === "team") return deadlines.filter((d) => d.type === "team");
    return deadlines;
  }, [deadlines, filter]);

  const handleEditDeadline = useCallback((deadline: Deadline) => {
    setEditingDeadline(deadline);
    setDeadlineModalOpen(true);
  }, []);

  const handleCloseDeadlineModal = useCallback(() => {
    setDeadlineModalOpen(false);
    setEditingDeadline(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Notification Poller — invisible, runs in background */}
      <NotificationPoller
        deadlines={deadlines ?? []}
        onNotification={addNotification}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo / Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shrink-0">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-gray-100 truncate">
                  AABW Deadline Tracker
                </h1>
                <p className="text-xs text-gray-500 truncate hidden sm:block">
                  Jul 8–12, 2026 · Ho Chi Minh City
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParseModalOpen(true)}
                className="hidden sm:flex gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Parse Schedule
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingDeadline(null);
                  setDeadlineModalOpen(true);
                }}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Deadline</span>
                <span className="sm:hidden">Add</span>
              </Button>

              {/* Alert Tray */}
              <AlertTray
                notifications={notifications}
                onDismiss={dismissNotification}
                unreadCount={unreadCount}
              />

              {/* AI Chat Toggle */}
              <Button
                variant={chatOpen ? "default" : "ghost"}
                size="icon"
                onClick={() => setChatOpen((v) => !v)}
                className="relative"
                title="Open AI Chat Assistant"
              >
                <Bot className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Timeline Section */}
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            chatOpen ? "lg:mr-96" : ""
          }`}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
            {/* Filter Bar */}
            <FilterBar filter={filter} onChange={setFilter} totalCounts={{
              all: deadlines?.length ?? 0,
              global: deadlines?.filter((d) => d.type === "global").length ?? 0,
              team: deadlines?.filter((d) => d.type === "team").length ?? 0,
            }} />

            {/* Parse Schedule button (mobile) */}
            <div className="mt-3 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParseModalOpen(true)}
                className="w-full gap-2 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Parse Schedule from Text / Image
              </Button>
            </div>

            {/* Timeline */}
            <div className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-lg bg-gray-900 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <TimelineView
                  deadlines={filteredDeadlines}
                  onEdit={handleEditDeadline}
                  onRefresh={mutate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      </main>

      {/* Modals */}
      <DeadlineModal
        open={deadlineModalOpen}
        deadline={editingDeadline}
        onClose={handleCloseDeadlineModal}
        onSaved={mutate}
      />

      <ParseUploadModal
        open={parseModalOpen}
        onClose={() => setParseModalOpen(false)}
        onSaved={mutate}
      />
    </div>
  );
}
