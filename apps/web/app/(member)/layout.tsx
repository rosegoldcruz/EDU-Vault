import type { ReactNode } from "react";
import MemberProviders from "./providers";

export const dynamic = "force-dynamic";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <MemberProviders>
      <div className="iv-root">{children}</div>
    </MemberProviders>
  );
}
