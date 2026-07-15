"use client";

import type { ReactNode } from "react";
import { EmptyState, ErrorState, LoadingState } from "./ui";

export function ResourceBoundary<T>({ resource, children, emptyTitle = "Nothing here yet", emptyMessage = "Activity will appear here when available." }: {
  resource: { status: "loading" | "success" | "empty" | "error"; data: T | null; error: string | null; retry: () => void };
  children: (data: T) => ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (resource.status === "loading") return <LoadingState title="Loading member data" rows={5} />;
  if (resource.status === "error") return <ErrorState message={resource.error ?? "Unable to load this page."} onRetry={resource.retry} />;
  if (resource.status === "empty") return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return resource.data ? children(resource.data) : <EmptyState title={emptyTitle} message={emptyMessage} />;
}
