"use client";

import { ErrorState } from "@/components/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <ErrorState title="This page could not be opened" message="The member interface hit an unexpected error." onRetry={reset} />;
}
