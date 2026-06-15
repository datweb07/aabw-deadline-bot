"use client";
import React from "react";
import { SWRConfig } from "swr";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * App-wide client providers.
 * SWRConfig is set up with a global fetcher and sensible defaults.
 * Notification state lives in DashboardShell via useNotifications hook (no context needed).
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) =>
          fetch(url).then((r) => {
            if (!r.ok) throw new Error("Fetch error");
            return r.json();
          }),
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
