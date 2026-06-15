"use client";
import React, { useState } from "react";
import { Clock, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { cn, getCategoryMeta, formatTime, formatTimeRemaining, isDeadlinePast } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Deadline } from "@/lib/types";

interface TimelineItemProps {
  deadline: Deadline;
  isLast: boolean;
  onEdit: (deadline: Deadline) => void;
  onRefresh: () => void;
}

export default function TimelineItem({ deadline, onEdit, onRefresh }: TimelineItemProps) {
  const [deleting, setDeleting] = useState(false);
  const isPast = isDeadlinePast(deadline.datetime);
  const meta = getCategoryMeta(deadline.category);

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
        "group relative flex gap-4 rounded-lg border p-4 transition-all",
        isPast
          ? "border-gray-800/50 bg-gray-900/30 opacity-60"
          : "border-gray-800 bg-gray-900 hover:border-gray-700"
      )}
    >
      {/* Timeline dot */}
      <div className="absolute -left-[29px] top-[18px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-800 bg-gray-950 z-10">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isPast ? "bg-gray-700" : meta.textColor.replace("text-", "bg-")
          )}
        />
      </div>

      {/* Time column */}
      <div className="w-16 shrink-0 text-right">
        <span
          className={cn(
            "text-sm font-mono font-medium tabular-nums",
            isPast ? "text-gray-600" : "text-gray-300"
          )}
        >
          {formatTime(deadline.time)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          {/* Category badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              meta.color,
              meta.textColor,
              meta.borderColor
            )}
          >
            {meta.label}
          </span>

          {/* Team badge */}
          {deadline.type === "team" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-xs font-medium text-purple-400">
              <Users className="h-3 w-3" />
              {deadline.teamName ?? "Team"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-medium text-sm leading-snug",
            isPast ? "text-gray-500" : "text-gray-100"
          )}
        >
          {deadline.title}
        </h3>

        {/* Location */}
        {deadline.location && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-gray-600 shrink-0" />
            <span className="text-xs text-gray-500 truncate">{deadline.location}</span>
          </div>
        )}

        {/* Time remaining (only for upcoming) */}
        {!isPast && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-gray-600 shrink-0" />
            <span className="text-xs text-gray-500">
              {formatTimeRemaining(deadline.datetime)}
            </span>
          </div>
        )}
      </div>

      {/* Actions (team deadlines only, on hover) */}
      {deadline.type === "team" && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(deadline)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-red-400"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
