import Link from "next/link";
import { notFound } from "next/navigation";

import { ScholarAssessmentPreview } from "@/components/academy/ScholarAssessmentPreview";
import { Breadcrumbs, scholarStyles as styles } from "@/components/academy/ScholarAcademyViews";
import { requireAdminAccess } from "@/lib/server/member-access";
import { getScholarAssessment, scholarHref } from "@/lib/server/scholar-academy";

export const dynamic = "force-dynamic";

export default async function ScholarAssessmentPage({ params }: { params: Promise<{ assessmentSlug: string }> }) {
  let access;
  try { access = await requireAdminAccess(); } catch { notFound(); }
  const { assessmentSlug } = await params;
  const detail = await getScholarAssessment(assessmentSlug, access.auth.privyUserId);
  if (!detail) notFound();
  return (
    <main className={styles.page}>
      <Breadcrumbs><Link href={scholarHref("pathways", detail.pathway.slug)}>{detail.pathway.title}</Link><span>/</span><Link href={scholarHref("courses", detail.course.slug)}>{detail.course.title}</Link><span>/</span><Link href={scholarHref("modules", detail.module.slug)}>{detail.module.title}</Link><span>/</span><span>Assessment</span></Breadcrumbs>
      <section className={styles.hero}><div><h1>{detail.assessment.title}</h1><p>Review each question, choose one answer, and move at your own pace. Correct answers remain private.</p></div><aside className={styles.heroAction}><strong>{detail.assessment.questions.length} questions</strong><span className={styles.meta}>No attempt limit in preview</span><small>Preview mode — scoring disabled.</small></aside></section>
      <ScholarAssessmentPreview assessment={detail.assessment} />
    </main>
  );
}
