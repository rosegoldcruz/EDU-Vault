export const CONTENT_BLOCK_TYPES = [
  "heading",
  "body",
  "list",
  "quote",
  "source",
  "warning",
  "callout",
  "timeline",
  "comparison",
  "calculator",
  "simulation",
  "scenario",
  "sorting",
  "reveal",
  "quiz",
  "assignment",
  "project",
  "narration",
  "media",
  "action",
] as const;

export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];
export type EvidenceClass =
  | "fact"
  | "interpretation"
  | "hypothesis"
  | "scenario";

export type SourceCitation = {
  label: string;
  url?: string;
  publisher?: string;
  reviewedAt?: string;
};

export type CurriculumContentBlock = {
  id: string;
  type: ContentBlockType;
  order: number;
  payload: Record<string, unknown>;
  evidenceClass: EvidenceClass | null;
  citations: SourceCitation[];
};

export type CurriculumLesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  lessonType: string;
  accessClass: "free" | "premium" | "vip" | "sovereign" | "internal";
  estimatedMinutes: number | null;
  xpValue: number;
  module: {
    id: string;
    slug: string;
    title: string;
  };
  course: {
    id: string;
    slug: string;
    title: string;
  };
  pathway: {
    id: string;
    slug: string;
    title: string;
  };
  blocks: CurriculumContentBlock[];
};
