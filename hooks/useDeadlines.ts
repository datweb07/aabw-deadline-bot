"use client";
import useSWR from "swr";
import type { Deadline, DeadlineFormInput, DeadlinesApiResponse } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch deadlines");
    return r.json() as Promise<DeadlinesApiResponse>;
  });

interface UseDeadlinesReturn {
  deadlines: Deadline[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  createDeadline: (input: DeadlineFormInput) => Promise<Deadline>;
  updateDeadline: (id: string, input: Partial<DeadlineFormInput>) => Promise<Deadline>;
  deleteDeadline: (id: string) => Promise<void>;
}

export function useDeadlines(): UseDeadlinesReturn {
  const { data, error, isLoading, mutate } = useSWR<DeadlinesApiResponse>(
    "/api/deadlines",
    fetcher,
    { refreshInterval: 30000 } // re-fetch every 30s to stay in sync with chat-created deadlines
  );

  const createDeadline = async (input: DeadlineFormInput): Promise<Deadline> => {
    const res = await fetch("/api/deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to create deadline");
    }
    const { deadline } = await res.json();
    await mutate();
    return deadline;
  };

  const updateDeadline = async (
    id: string,
    input: Partial<DeadlineFormInput>
  ): Promise<Deadline> => {
    const res = await fetch(`/api/deadlines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to update deadline");
    }
    const { deadline } = await res.json();
    await mutate();
    return deadline;
  };

  const deleteDeadline = async (id: string): Promise<void> => {
    const res = await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to delete deadline");
    }
    await mutate();
  };

  return {
    deadlines: data?.deadlines,
    isLoading,
    error,
    mutate,
    createDeadline,
    updateDeadline,
    deleteDeadline,
  };
}
