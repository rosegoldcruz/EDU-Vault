import { AppProviders } from "@/components/providers";
import { AppShell } from "@/components/app-shell";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const mockMode = process.env.MEMBER_MOCK_MODE === "true";
  const dataMode = process.env.MEMBER_DATA_MODE === "api" ? "api" : "mock";
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

  return <AppProviders mockMode={mockMode} dataMode={dataMode} privyAppId={privyAppId}><AppShell>{children}</AppShell></AppProviders>;
}
