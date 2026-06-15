"use client";
import { useEffect, useRef, useCallback } from "react";
import { isDeadlineApproaching, isDeadlinePast, buildNotificationKey } from "@/lib/utils";
import type { Deadline } from "@/lib/types";
import type { AppNotification } from "@/lib/types";

const POLL_INTERVAL =
  parseInt(process.env.NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL ?? "30000", 10) || 30000;

interface NotificationPollerProps {
  deadlines: Deadline[];
  onNotification: (deadline: Deadline, window: 15 | 30) => void;
}

export default function NotificationPoller({
  deadlines,
  onNotification,
}: NotificationPollerProps) {
  // Session-scoped set of already-issued notification keys
  const issuedKeys = useRef<Set<string>>(new Set());

  const checkDeadlines = useCallback(
    (currentDeadlines: Deadline[]) => {
      for (const deadline of currentDeadlines) {
        if (isDeadlinePast(deadline.datetime)) continue;

        // Check 30-minute window
        const key30 = buildNotificationKey(deadline.id, 30);
        if (isDeadlineApproaching(deadline.datetime, 30) && !issuedKeys.current.has(key30)) {
          issuedKeys.current.add(key30);
          onNotification(deadline, 30);
        }

        // Check 15-minute window
        const key15 = buildNotificationKey(deadline.id, 15);
        if (isDeadlineApproaching(deadline.datetime, 15) && !issuedKeys.current.has(key15)) {
          issuedKeys.current.add(key15);
          onNotification(deadline, 15);
        }
      }
    },
    [onNotification]
  );

  // Run immediately on mount and when deadlines change
  useEffect(() => {
    if (deadlines.length > 0) {
      checkDeadlines(deadlines);
    }
  }, [deadlines, checkDeadlines]);

  // Run on interval
  useEffect(() => {
    const interval = setInterval(() => {
      checkDeadlines(deadlines);
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [deadlines, checkDeadlines]);

  // This component renders nothing
  return null;
}
