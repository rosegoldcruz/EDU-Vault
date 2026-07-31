import { notFound } from "next/navigation";

import { PathwayView } from "@/components/academy/ScholarAcademyViews";
import { requireAdminAccess } from "@/lib/server/member-access";
import { getScholarPathway } from "@/lib/server/scholar-academy";

export const dynamic = "force-dynamic";

export default async function ScholarPathwayPage({ params }: { params: Promise<{ pathwaySlug: string }> }) {
  let access;
  try { access = await requireAdminAccess(); } catch { notFound(); }
  const { pathwaySlug } = await params;
  const pathway = await getScholarPathway(pathwaySlug, access.auth.privyUserId);
  if (!pathway) notFound();
  return <PathwayView pathway={pathway} />;
}
