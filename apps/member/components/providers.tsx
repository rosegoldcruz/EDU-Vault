"use client";

import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { DataMode, MemberIdentity } from "@/lib/contracts";
import { mockMemberData } from "@/lib/mock-data";

type Session = { identity: MemberIdentity; getAccessToken: () => Promise<string | null>; logout: () => Promise<void>; isMock: boolean };
type AppContextValue = { dataMode: DataMode; session: Session };
const AppContext = createContext<AppContextValue | null>(null);

const mockSession: Session = { identity: mockMemberData.identity, getAccessToken: async () => null, isMock: true, logout: async () => undefined };

function RealSession({ children, dataMode }: { children: ReactNode; dataMode: DataMode }) {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const email = user?.email?.address ?? user?.google?.email ?? "Signed-in member";
  const identity = useMemo<MemberIdentity>(() => ({ id: user?.id ?? "pending", displayName: email.split("@")[0], email, role: "MEMBER", initials: email.slice(0, 2).toUpperCase() }), [email, user?.id]);
  const value = useMemo<AppContextValue>(() => ({ dataMode, session: { identity, getAccessToken, isMock: false, logout } }), [dataMode, getAccessToken, identity, logout]);

  if (!ready) return <div className="auth-screen"><div className="loader" /><p>Checking your Iron Vault session</p></div>;
  if (!authenticated) return <div className="auth-screen"><div className="auth-panel"><span className="brand-mark">IV</span><h1>Member Back Office</h1><p>Sign in with your Iron Vault identity. Authentication alone does not grant paid access.</p><button className="button button-primary" onClick={login}>Sign in with Privy</button></div></div>;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProviders({ children, mockMode, dataMode, privyAppId }: { children: ReactNode; mockMode: boolean; dataMode: DataMode; privyAppId: string }) {
  if (mockMode) return <AppContext.Provider value={{ dataMode: "mock", session: mockSession }}>{children}</AppContext.Provider>;
  if (!privyAppId) return <div className="auth-screen"><div className="auth-panel"><span className="brand-mark">IV</span><h1>Authentication configuration required</h1><p>Set a Privy application ID, or explicitly enable MEMBER_MOCK_MODE for local visual testing.</p></div></div>;
  return <PrivyProvider appId={privyAppId}><RealSession dataMode={dataMode}>{children}</RealSession></PrivyProvider>;
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useAppContext must be used inside AppProviders");
  return value;
}
