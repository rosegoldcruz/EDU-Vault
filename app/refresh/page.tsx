import { AcademyProviders } from "@/app/academy/AcademyProviders";
import { getPublicPrivyAppId } from "@/lib/auth/privy";
import { RefreshSession } from "./RefreshSession";

export const dynamic = "force-dynamic";

export default async function RefreshPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo = "/academy" } = await searchParams;
  const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/academy";
  return (
    <AcademyProviders appId={getPublicPrivyAppId()}>
      <main className="academy-auth-page"><RefreshSession returnTo={safeReturnTo} /></main>
    </AcademyProviders>
  );
}
