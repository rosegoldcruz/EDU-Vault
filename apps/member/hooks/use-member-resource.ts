"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMemberAdapter } from "@/lib/adapters";
import type { MemberData, MutationResult } from "@/lib/contracts";
import { useAppContext } from "@/components/providers";

type LoadState<T> = { status: "loading"; data: null; error: null } | { status: "success"; data: T; error: null } | { status: "empty"; data: T; error: null } | { status: "error"; data: null; error: string };

export function useMemberResource<K extends keyof MemberData>(key: K, emptyValue: MemberData[K]) {
  const { dataMode, session } = useAppContext();
  const searchParams = useSearchParams();
  const forcedState = searchParams.get("state");
  const adapter = useMemo(() => createMemberAdapter(dataMode, session.getAccessToken), [dataMode, session.getAccessToken]);
  const emptyValueRef = useRef(emptyValue);
  const [state, setState] = useState<LoadState<MemberData[K]>>({ status: "loading", data: null, error: null });

  const load = useCallback(async () => {
    if (forcedState === "loading") { setState({ status: "loading", data: null, error: null }); return; }
    if (forcedState === "error") { setState({ status: "error", data: null, error: "This preview simulates an unavailable member service." }); return; }
    if (forcedState === "empty") { setState({ status: "empty", data: emptyValueRef.current, error: null }); return; }
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });
    try {
      const result = await adapter.read(key, controller.signal);
      setState({ status: "success", data: result.data, error: null });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState({ status: "error", data: null, error: error instanceof Error ? error.message : "Unable to load member data." });
    }
    return () => controller.abort();
  }, [adapter, forcedState, key]);

  useEffect(() => { void load(); }, [load]);
  const submit = useCallback(<T extends object>(path: string, payload: T): Promise<MutationResult<T & { id: string }>> => adapter.submit(path, payload), [adapter]);
  return { ...state, retry: load, submit, mode: dataMode };
}
