import { notFound } from "next/navigation";

import { CourseView } from "@/components/academy/ScholarAcademyViews";
import { requireAdminAccess } from "@/lib/server/member-access";
import { getScholarCourse } from "@/lib/server/scholar-academy";

export const dynamic = "force-dynamic";

export default async function ScholarCoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  let access;
  try { access = await requireAdminAccess(); } catch { notFound(); }
  const { courseSlug } = await params;
  const detail = await getScholarCourse(courseSlug, access.auth.privyUserId);
  if (!detail) notFound();
  return <CourseView {...detail} />;
}
