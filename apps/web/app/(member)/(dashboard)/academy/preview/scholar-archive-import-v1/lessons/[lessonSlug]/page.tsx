import Link from "next/link";
import { notFound } from "next/navigation";

import { DraftLessonRenderer } from "@/components/academy/DraftLessonRenderer";
import {
  getScholarLesson,
  scholarHref,
} from "@/lib/server/scholar-academy";
import { requireAdminAccess } from "@/lib/server/member-access";

export const dynamic = "force-dynamic";

export default async function ScholarDraftLessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  let access;
  try {
    access = await requireAdminAccess();
  } catch {
    notFound();
  }
  const { lessonSlug } = await params;
  const preview = await getScholarLesson(lessonSlug, access.auth.privyUserId);
  if (!preview) notFound();

  return (
    <div className="academy-app-main">
      <nav className="academy-breadcrumb" aria-label="Breadcrumb">
        <Link href={scholarHref()}>Academy</Link>
        <span>/</span>
        <Link href={scholarHref("pathways", preview.lesson.pathway.slug)}>{preview.lesson.pathway.title}</Link>
        <span>/</span>
        <Link href={scholarHref("courses", preview.lesson.course.slug)}>{preview.lesson.course.title}</Link>
        <span>/</span>
        <Link href={scholarHref("modules", preview.lesson.module.slug)}>{preview.lesson.module.title}</Link>
      </nav>
      <DraftLessonRenderer preview={preview} />
    </div>
  );
}
