"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export default function CurrentTimeLine() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center gap-3 my-4 pl-10">
      {/* Pulsing dot on the timeline */}
      <div className="absolute -left-[21px] flex h-4 w-4 items-center justify-center z-10">
        <span className="absolute inline-flex h-4 w-4 rounded-full bg-blue-500 opacity-20 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
      </div>

      {/* Line + label */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-px bg-blue-500/40" />
        <span className="text-xs font-semibold text-blue-400 shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
          NOW · {format(now, "h:mm a")}
        </span>
        <div className="flex-1 h-px bg-blue-500/40" />
      </div>
    </div>
  );
}
