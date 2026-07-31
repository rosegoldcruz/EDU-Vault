import { notFound } from "next/navigation";

import { AcademyHome } from "@/components/academy/ScholarAcademyViews";
import { requireAdminAccess } from "@/lib/server/member-access";
import { getScholarAcademy } from "@/lib/server/scholar-academy";

export const dynamic = "force-dynamic";

export default async function ScholarAcademyHomePage() {
  let access;
  try {
    access = await requireAdminAccess();
  } catch {
    notFound();
  }
  const academy = await getScholarAcademy(access.auth.privyUserId);
  if (!academy) notFound();
  return <AcademyHome academy={academy} />;
}
