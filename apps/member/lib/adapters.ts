import { mockMemberData } from "./mock-data";
import type { AdapterResult, DataMode, MemberData, MutationResult, ResourceKey } from "./contracts";

const API_PATHS: Record<ResourceKey | "identity", string> = {
  identity: "/v1/member/me",
  membership: "/v1/member/membership",
  wallet: "/v1/member/wallet",
  dashboard: "/v1/member/dashboard",
  positions: "/v1/member/positions",
  referrals: "/v1/member/referrals",
  tickets: "/v1/member/tickets",
  rewards: "/v1/member/rewards",
  academy: "/v1/member/academy/summary",
  status: "/v1/member/status",
  vip: "/v1/member/vip",
};

export interface MemberAdapter {
  read<K extends keyof MemberData>(key: K, signal?: AbortSignal): Promise<AdapterResult<MemberData[K]>>;
  submit<T extends object>(path: string, payload: T): Promise<MutationResult<T & { id: string }>>;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createMemberAdapter(mode: DataMode, getAccessToken: () => Promise<string | null>): MemberAdapter {
  async function read<K extends keyof MemberData>(key: K, signal?: AbortSignal): Promise<AdapterResult<MemberData[K]>> {
      if (mode === "mock") {
        await pause(180);
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        return { data: structuredClone(mockMemberData[key]), mode, receivedAt: new Date().toISOString() };
      }

      const baseUrl = process.env.NEXT_PUBLIC_MEMBER_API_URL ?? "";
      const accessToken = await getAccessToken();
      const response = await fetch(`${baseUrl}${API_PATHS[key]}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error(`Member API returned ${response.status}`);
      return { data: await response.json() as MemberData[typeof key], mode, receivedAt: new Date().toISOString() };
  }

  async function submit<T extends object>(path: string, payload: T): Promise<MutationResult<T & { id: string }>> {
      if (mode === "mock") {
        await pause(320);
        return {
          data: { ...payload, id: `local_${Date.now()}` }, mode, persisted: false,
          message: "Saved in this local mock session only. No production data was changed.",
        };
      }

      const baseUrl = process.env.NEXT_PUBLIC_MEMBER_API_URL ?? "";
      const accessToken = await getAccessToken();
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST", headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Member API returned ${response.status}`);
      return { data: await response.json() as T & { id: string }, mode, persisted: true, message: "Saved." };
  }

  return { read, submit };
}
