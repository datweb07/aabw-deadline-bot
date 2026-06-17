"use client";
import React from "react";
import { cn, getCategoryMeta } from "@/lib/utils";
import { Search, X } from "lucide-react";
import type { TimelineFilter, DeadlineCategory } from "@/lib/types";

interface FilterBarProps {
  filter: TimelineFilter;
  onChange: (filter: TimelineFilter) => void;
  totalCounts: { all: number; global: number; team: number };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (c: string | null) => void;
}

const TABS: { value: TimelineFilter; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "" },
  { value: "global", label: "Event", emoji: "" },
  { value: "team", label: "Team", emoji: "" },
];

export default function FilterBar({ filter, onChange, totalCounts, searchQuery, onSearchChange, selectedCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Type Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
      {TABS.map((tab) => {
        const count = totalCounts[tab.value];
        const isActive = filter === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
              isActive
                ? "bg-green-600 border-green-500 text-white"
                : "bg-white border-gray-200 text-gray-600"
            )}
          >
            <span className="text-base leading-none">{tab.emoji}</span>
            {tab.label}
            <span
              className={cn(
                "text-xs tabular-nums px-1.5 py-0.5 rounded-full",
                isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
      </div>

      {/* Category Filter Badge */}
      {selectedCategory && (
        <div className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold border", getCategoryMeta(selectedCategory as DeadlineCategory).color, getCategoryMeta(selectedCategory as DeadlineCategory).textColor, getCategoryMeta(selectedCategory as DeadlineCategory).borderColor)}>
          {getCategoryMeta(selectedCategory as DeadlineCategory).label}
          <button onClick={() => onCategoryChange(null)} className="ml-1 hover:opacity-70 focus:outline-none">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex-1" />

      {/* Search Input */}
      <div className="relative w-full sm:w-64 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
