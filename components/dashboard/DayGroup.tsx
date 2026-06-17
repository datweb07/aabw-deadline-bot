"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import TimelineItem from "./TimelineItem";
import type { Deadline } from "@/lib/types";

interface DayGroupProps {
  date: string;
  dayHeader: string;
  deadlines: Deadline[];
  onEdit: (deadline: Deadline) => void;
  onRefresh: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  onCategoryClick?: (category: string) => void;
}

export default function DayGroup({ date, dayHeader, deadlines, onEdit, onRefresh, isExpanded, onToggle, onCategoryClick }: DayGroupProps) {
  const allPast = deadlines.every((d) => new Date(d.datetime) < new Date());

  return (
    <div className="mb-8" id={`day-${date}`}>
      {/* Day header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 mb-4 group focus:outline-none"
      >
        <div className={cn(
          "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-colors",
          allPast ? "text-gray-500 bg-transparent border-gray-200 group-hover:bg-gray-50" : "text-green-700"
        )}>
          {dayHeader}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded ? "rotate-180" : "rotate-0")} />
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </button>

      {/* Items with vertical line */}
      {isExpanded && (
        <div className="relative pl-10">
          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gray-200" />
          <div className="space-y-3">
            {deadlines.map((deadline, idx) => (
              <TimelineItem
                key={deadline.id}
                deadline={deadline}
                isLast={idx === deadlines.length - 1}
                onEdit={onEdit}
                onRefresh={onRefresh}
                onCategoryClick={onCategoryClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
