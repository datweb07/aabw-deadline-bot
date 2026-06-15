"use client";
import React from "react";
import { cn } from "@/lib/utils";
import TimelineItem from "./TimelineItem";
import type { Deadline } from "@/lib/types";

interface DayGroupProps {
  date: string;
  dayHeader: string;
  deadlines: Deadline[];
  onEdit: (deadline: Deadline) => void;
  onRefresh: () => void;
}

export default function DayGroup({ dayHeader, deadlines, onEdit, onRefresh }: DayGroupProps) {
  const allPast = deadlines.every(
    (d) => new Date(d.datetime) < new Date()
  );

  return (
    <div className="mb-8">
      {/* Day Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded",
            allPast
              ? "text-gray-600 bg-gray-900"
              : "text-blue-400 bg-blue-500/10"
          )}
        >
          {dayHeader}
        </div>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Timeline items */}
      <div className="relative pl-10">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gray-800" />

        <div className="space-y-3">
          {deadlines.map((deadline, idx) => (
            <TimelineItem
              key={deadline.id}
              deadline={deadline}
              isLast={idx === deadlines.length - 1}
              onEdit={onEdit}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
