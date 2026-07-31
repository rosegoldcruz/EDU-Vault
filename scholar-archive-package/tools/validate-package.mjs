#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const PACKAGE_DIR = resolve(import.meta.dirname, "..");
const data = async (name) => JSON.parse(await readFile(resolve(PACKAGE_DIR, "data", name), "utf8"));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const [
  sources,
  sourceCurriculum,
  curriculum,
  assessments,
  answerKeys,
  interactions,
  activities,
  narration,
  canvas,
  canvasCoverage,
  validation,
] = await Promise.all([
  data("sources.json"),
  data("curriculum-source-records.json"),
  data("curriculum-canonical.json"),
  data("assessments.json"),
  data("answer-keys.private.json"),
  data("interactions.json"),
  data("learning-activities.json"),
  data("narration-manifest.json"),
  data("canvas-blueprints.json"),
  data("canvas-coverage-map.json"),
  data("validation.json"),
]);

const canvasExtraction = JSON.parse(await readFile(
  resolve(PACKAGE_DIR, "source-extractions/master-curriculum-canvas.complete.json"),
  "utf8",
));
const canonicalLessons = curriculum.flatMap((module) => module.lessons);
const sourceLessons = sourceCurriculum.flatMap((module) => module.lessons);
const publicAssessmentText = JSON.stringify({ sourceCurriculum, curriculum, assessments });
const ids = [
  ...curriculum.map((module) => module.id),
  ...canonicalLessons.map((lesson) => lesson.id),
  ...canonicalLessons.flatMap((lesson) => lesson.blocks.map((block) => block.id)),
  ...assessments.map((assessment) => assessment.id),
  ...assessments.flatMap((assessment) => assessment.questions.map((question) => question.id)),
  ...assessments.flatMap((assessment) => assessment.questions.flatMap((question) => question.options.map((option) => option.id))),
];

check(sources.length === 12, "Expected all 12 archive files.");
check(new Set(sources.map((source) => source.sourceFilename)).size === 12, "Source filenames are not unique.");
check(sources.every((source) => /^[a-f0-9]{64}$/.test(source.sha256)), "Every source must have a SHA-256.");
check(sourceCurriculum.length === 38, "Expected 38 source module records including variants.");
check(sourceLessons.length === 178, "Expected 178 source lesson records including variants.");
check(curriculum.length === 32, "Expected 32 canonical modules.");
check(canonicalLessons.length === 138, "Expected 138 canonical authored lesson bodies.");
check(canonicalLessons.every((lesson) => lesson.blocks.length > 0), "Every canonical lesson must contain blocks.");
check(canonicalLessons.every((lesson) => lesson.narrationText.length > 0), "Every canonical lesson must have narration text.");
check(assessments.length === 32, "Expected 32 canonical module assessments.");
check(assessments.flatMap((assessment) => assessment.questions).length === 320, "Expected 320 canonical questions.");
check(answerKeys.length === 320, "Expected 320 private answer-key records.");
check(answerKeys.every((key) => key.correctOptionId), "Every question must have a private correct option ID.");
check(!publicAssessmentText.includes('"assessmentSource"'), "Embedded assessment sources leaked into curriculum exports.");
check(!publicAssessmentText.includes('"correctSourceIndex"'), "Correct source indexes leaked into public-safe exports.");
check(!publicAssessmentText.includes('"correctOptionId"'), "Correct option IDs leaked into public-safe exports.");
check(interactions.length === 26, "Expected 26 authored interaction instances.");
check(activities.assignments.length > 0, "Expected authored lesson assignments.");
check(activities.authoredProjects.length === 0, "No complete authored project body was found; do not invent one.");
check(activities.authoredCapstones.length === 0, "No complete authored capstone body was found; do not invent one.");
check(Object.keys(narration).length === 138, "Expected one narration association per canonical lesson.");
check(canvasExtraction.tables.length === 38, "Expected all 38 DOCX tables.");
check(canvasExtraction.paragraphs.length === 915, "Expected all 915 non-empty DOCX paragraphs.");
check(canvas.outlinedCourses.length === 20, "Expected 20 named detailed Canvas course outlines.");
check(canvas.outlinedCourses.every((course) => course.courseTitle), "Every detailed Canvas outline must have a course title.");
check(canvasCoverage.length === 180, "Expected all 180 detailed Canvas outline items in the coverage map.");
check(canvasCoverage.every((item) => item.publicationStatus === "unpublished"), "Canvas coverage items must remain unpublished.");
check(new Set(ids).size === ids.length, "Stable IDs must be unique across the canonical package.");
check(validation.publicationState === "unpublished-offline-package", "Package must remain unpublished.");
check(validation.databaseChangedByBuilder === false, "Database change flag must remain false.");
check(validation.activeReleaseChangedByBuilder === false, "Active release change flag must remain false.");

if (failures.length) {
  console.error(JSON.stringify({ passed: false, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    passed: true,
    checks: 31,
    sources: sources.length,
    canonicalLessons: canonicalLessons.length,
    assessments: assessments.length,
    answerKeys: answerKeys.length,
    interactions: interactions.length,
    assignments: activities.assignments.length,
    canvasOutlineItems: canvasCoverage.length,
    docxTables: canvasExtraction.tables.length,
    publicationState: validation.publicationState,
  }, null, 2));
}
