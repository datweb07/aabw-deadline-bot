"use client";
import React from "react";
import { X, Clock } from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

interface NotificationItemProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
}

export default function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const isUrgent = notification.proximityWindow === 15;

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 bg-gray-800/60 border border-gray-700/50 group">
      {/* Icon */}
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5 ${
          isUrgent ? "bg-red-500/20" : "bg-orange-500/20"
        }`}
      >
        <Clock
          className={`h-3.5 w-3.5 ${isUrgent ? "text-red-400" : "text-orange-400"}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 leading-snug truncate">
          {notification.deadlineTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${
              isUrgent
                ? "bg-red-500/20 text-red-400"
                : "bg-orange-500/20 text-orange-400"
            }`}
          >
            {notification.proximityWindow} min
          </span>
          <span className="text-xs text-gray-500">
            {formatTimeRemaining(notification.deadlineDatetime)}
          </span>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(notification.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-300 shrink-0 mt-0.5"
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
