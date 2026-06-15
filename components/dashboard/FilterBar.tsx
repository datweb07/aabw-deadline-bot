"use client";
import React from "react";
import { cn } from "@/lib/utils";
import type { TimelineFilter } from "@/lib/types";

interface FilterBarProps {
  filter: TimelineFilter;
  onChange: (filter: TimelineFilter) => void;
  totalCounts: { all: number; global: number; team: number };
}

const TABS: { value: TimelineFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "global", label: "Event" },
  { value: "team", label: "Team" },
];

export default function FilterBar({ filter, onChange, totalCounts }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800 w-fit">
      {TABS.map((tab) => {
        const count = totalCounts[tab.value];
        const isActive = filter === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              isActive
                ? "bg-gray-800 text-gray-100 shadow-sm"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-xs tabular-nums",
                isActive ? "text-gray-300" : "text-gray-600"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
