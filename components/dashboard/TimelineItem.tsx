"use client";
import React, { useState } from "react";
import { Clock, MapPin, Pencil, Trash2, Users, CalendarPlus } from "lucide-react";
import { cn, getCategoryMeta, formatTime, formatTimeRemaining, isDeadlinePast } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Deadline } from "@/lib/types";

interface TimelineItemProps {
  deadline: Deadline;
  isLast: boolean;
  onEdit: (deadline: Deadline) => void;
  onRefresh: () => void;
  onCategoryClick?: (category: string) => void;
}

const generateGoogleCalendarLink = (deadline: Deadline) => {
  const start = new Date(deadline.datetime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const dates = `${formatDate(start)}/${formatDate(end)}`;
  const text = encodeURIComponent(deadline.title);
  const details = encodeURIComponent(deadline.description || "");
  const location = encodeURIComponent(deadline.location || "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
};

// Category dot colors for the left timeline indicator
const CATEGORY_DOT: Record<string, string> = {
  workshop: "bg-blue-500",
  submission: "bg-red-500",
  food_perks: "bg-green-500",
  team: "bg-purple-500",
  hackathon: "bg-orange-500",
  ceremony: "bg-yellow-500",
  general: "bg-gray-400",
};

export default function TimelineItem({ deadline, onEdit, onRefresh, onCategoryClick }: TimelineItemProps) {
  const [deleting, setDeleting] = useState(false);
  const isPast = isDeadlinePast(deadline.datetime);
  const meta = getCategoryMeta(deadline.category);
  const dot = CATEGORY_DOT[deadline.category] ?? "bg-gray-400";

  const handleDelete = async () => {
    if (!confirm(`Delete "${deadline.title}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/deadlines/${deadline.id}`, { method: "DELETE" });
      onRefresh();
    } catch {
      alert("Failed to delete deadline.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all",
        isPast
          ? "border-gray-200 bg-gray-50 opacity-40 grayscale"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {/* Colored left border accent */}
      {/* <div className={cn("absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl", isPast ? "bg-gray-300" : dot)} /> */}

      {/* Timeline dot on the connector line */}
      <div className="absolute -left-[29px] top-[18px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-white z-10">
        <div className={cn("h-2 w-2 rounded-full", isPast ? "bg-gray-300" : dot)} />
      </div>

      {/* Time */}
      <div className="w-16 shrink-0 text-right pt-0.5">
        <span className={cn("text-sm font-mono font-semibold tabular-nums", isPast ? "text-gray-400" : "text-gray-600")}>
          {formatTime(deadline.time)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <button 
            onClick={() => onCategoryClick?.(deadline.category)}
            className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border transition-opacity hover:opacity-80", meta.color, meta.textColor, meta.borderColor)}
          >
            {meta.label}
          </button>
          {deadline.type === "team" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 px-2 py-0.5 text-[11px] font-medium text-purple-400">
              <Users className="h-2.5 w-2.5" />
              {deadline.teamName ?? "Team"}
            </span>
          )}
        </div>

        <h3 className={cn("font-semibold text-sm leading-snug", isPast ? "text-gray-500" : "text-gray-900")}>
          {deadline.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          {deadline.location && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {deadline.location}
            </span>
          )}
          {!isPast && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              (() => {
                const mins = Math.floor((new Date(deadline.datetime).getTime() - Date.now()) / 60000);
                if (mins <= 15) return "text-red-400";
                if (mins <= 30) return "text-orange-400";
                return "text-gray-500";
              })()
            )}>
              <Clock className="h-3 w-3 shrink-0" />
              {formatTimeRemaining(deadline.datetime)}
            </span>
          )}
          {!isPast && (
            <a 
              href={generateGoogleCalendarLink(deadline)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium ml-auto sm:ml-0"
              title="Add to Google Calendar"
            >
              <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </a>
          )}
        </div>
      </div>

      {/* Team actions */}
      {deadline.type === "team" && (
        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-gray-900" onClick={() => onEdit(deadline)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-400" onClick={handleDelete} disabled={deleting} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
