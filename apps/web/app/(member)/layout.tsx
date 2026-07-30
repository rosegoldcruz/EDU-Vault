import type { ReactNode } from "react";
import MemberProviders from "./providers";
import "@/app/member-theme.css";

export const dynamic = "force-dynamic";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <MemberProviders>{children}</MemberProviders>;
}
