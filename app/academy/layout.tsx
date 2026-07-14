import { AcademyProviders } from "./AcademyProviders";
import { AppChrome } from "./AppChrome";
import { getPublicPrivyAppId, requirePageUser } from "@/lib/auth/privy";

export const dynamic = "force-dynamic";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("/academy");
  return (
    <AcademyProviders appId={getPublicPrivyAppId()}>
      <AppChrome user={user}>{children}</AppChrome>
    </AcademyProviders>
  );
}
