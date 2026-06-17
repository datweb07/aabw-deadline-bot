"use client";
import React, { useMemo, useState } from "react";
import { groupDeadlinesByDate, getEventDayNumber, formatDayHeader, isDeadlinePast } from "@/lib/utils";
import DayGroup from "./DayGroup";
import CurrentTimeLine from "./CurrentTimeLine";
import type { Deadline } from "@/lib/types";

interface TimelineViewProps {
  deadlines: Deadline[];
  onEdit: (deadline: Deadline) => void;
  onRefresh: () => void;
  onCategoryClick?: (category: string) => void;
}

export default function TimelineView({ deadlines, onEdit, onRefresh, onCategoryClick }: TimelineViewProps) {
  const grouped = useMemo(() => groupDeadlinesByDate(deadlines), [deadlines]);



  const dates = Array.from(grouped.keys());

  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});

  const toggleDay = (date: string) => {
    setExpandedState(prev => {
      const isCurrentlyExpanded = prev[date] !== undefined ? prev[date] : date >= new Date().toISOString().split("T")[0];
      return { ...prev, [date]: !isCurrentlyExpanded };
    });
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    dates.forEach(d => next[d] = true);
    setExpandedState(next);
  };
  
  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    dates.forEach(d => next[d] = false);
    setExpandedState(next);
  };

  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-600 font-medium">No deadlines found</p>
        <p className="text-gray-500 text-sm mt-1">
          Add a team deadline or parse a schedule to get started.
        </p>
      </div>
    );
  }

  // Determine where to insert the "now" line — between past and future dates
  const now = new Date();
  let nowInsertAfterIndex = -1;
  for (let i = 0; i < dates.length; i++) {
    const dateDeadlines = grouped.get(dates[i])!;
    const allPast = dateDeadlines.every((d) => isDeadlinePast(d.datetime));
    if (allPast) {
      nowInsertAfterIndex = i;
    }
  }

  return (
    <div className="space-y-0">
      {/* Sticky Day Tabs */}
      <div className="sticky top-14 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2 -mx-6 px-6 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {dates.map((date) => {
             const dayNumber = getEventDayNumber(date);
             return (
               <button
                 key={date}
                 onClick={() => {
                   setExpandedState(prev => ({ ...prev, [date]: true }));
                   setTimeout(() => {
                     document.getElementById(`day-${date}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }, 50);
                 }}
                 className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 whitespace-nowrap transition-colors"
               >
                 Day {dayNumber}
               </button>
             );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
           <button onClick={expandAll} className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider">Expand</button>
           <span className="text-gray-300">|</span>
           <button onClick={collapseAll} className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider">Collapse</button>
        </div>
      </div>

      {dates.map((date, idx) => {
        const dayDeadlines = grouped.get(date)!;
        const dayNumber = getEventDayNumber(date);
        const dayHeader = formatDayHeader(date, dayNumber);
        
        const isExpanded = expandedState[date] !== undefined ? expandedState[date] : date >= new Date().toISOString().split("T")[0];

        return (
          <React.Fragment key={date}>
            <DayGroup
              date={date}
              dayHeader={dayHeader}
              deadlines={dayDeadlines}
              onEdit={onEdit}
              onRefresh={onRefresh}
              isExpanded={isExpanded}
              onToggle={() => toggleDay(date)}
              onCategoryClick={onCategoryClick}
            />
            {idx === nowInsertAfterIndex && (
              <CurrentTimeLine />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
