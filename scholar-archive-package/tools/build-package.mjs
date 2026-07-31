#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import vm from "node:vm";

const ROOT = resolve(import.meta.dirname, "../..");
const SOURCE_DIR = join(ROOT, "sex");
const PACKAGE_DIR = resolve(import.meta.dirname, "..");
const DATA_DIR = join(PACKAGE_DIR, "data");
const REPORT_DIR = join(PACKAGE_DIR, "reports");
const EXTRACT_DIR = join(PACKAGE_DIR, "source-extractions");

const SOURCE_FILES = [
  "contentblock-interactive-extension.jsx",
  "generate-lesson-audio.mjs",
  "instructor-integration.md",
  "iron-vault-academy-gated.jsx",
  "iron-vault-academy-unlocked (1).jsx",
  "iron-vault-modules-13-22.jsx",
  "iron-vault-modules-7-12.md",
  "Iron_Vault_Master_Curriculum_Canvas.docx",
  "LessonInstructor.jsx",
  "module zero.md",
  "VaultLoadingScreen-integration.md",
  "VaultLoadingScreen.jsx",
];

const DETECTED_ROLES = {
  "contentblock-interactive-extension.jsx": {
    actualType: "motion-and-design-directive",
    sourceFamily: "media-motion",
    instructions: ["GSAP/Lenis/Motion ownership", "reduced-motion fallback", "performance and CLS budgets"],
    contradictions: ["Filename says interactive content blocks; payload is a site-wide motion directive."],
  },
  "generate-lesson-audio.mjs": {
    actualType: "interactive-block-react-reference",
    sourceFamily: "interactive-capabilities",
    instructions: ["Five local-state interaction behaviors and their source data shapes"],
    contradictions: ["Filename says audio generator; payload implements calculator, simulator, scenario, sortgame, and reveal."],
  },
  "instructor-integration.md": {
    actualType: "elevenlabs-offline-audio-generator",
    sourceFamily: "narration",
    instructions: ["Offline ElevenLabs synthesis", "content-hash cache", "word timing generation", "narration derivation"],
    contradictions: ["Markdown filename contains executable Node.js rather than an integration guide."],
  },
  "iron-vault-academy-gated.jsx": {
    actualType: "lesson-instructor-integration-guide",
    sourceFamily: "narration",
    instructions: ["Begin-lesson autoplay", "audio/timing associations", "HeyGen video asset upgrade"],
    contradictions: ["Filename says gated Academy; payload is an instructor/narration integration guide."],
  },
  "iron-vault-academy-unlocked (1).jsx": {
    actualType: "gated-original-academy-with-embedded-curriculum",
    sourceFamily: "original-academy-gated",
    instructions: ["Legacy gated UI and browser scoring are reference-only and excluded from this package."],
    contradictions: ["Filename says unlocked; source header and behavior identify the gated variant."],
  },
  "iron-vault-modules-13-22.jsx": {
    actualType: "unlocked-original-academy-with-embedded-curriculum",
    sourceFamily: "original-academy-unlocked",
    instructions: ["Legacy unlocked UI and browser scoring are reference-only and excluded from this package."],
    contradictions: ["Filename says modules 13–22; payload is the unlocked modules 1–6 Academy."],
  },
  "iron-vault-modules-7-12.md": {
    actualType: "authored-modules-13-22-javascript",
    sourceFamily: "modules-13-22",
    instructions: ["Append-only legacy module array; presentation instructions excluded."],
    contradictions: ["Filename says modules 7–12; payload declares MODULES_13_22."],
  },
  "Iron_Vault_Master_Curriculum_Canvas.docx": {
    actualType: "authored-modules-7-12-markdown",
    sourceFamily: "modules-7-12",
    instructions: ["Six complete lessons and ten questions per module."],
    contradictions: ["DOCX extension is false; payload is UTF-8 Markdown for Modules 7–12."],
  },
  "LessonInstructor.jsx": {
    actualType: "master-curriculum-canvas-docx",
    sourceFamily: "master-canvas",
    instructions: ["Canonical pathways, course outlines, bootcamp, developer/AI/security/growth programs, interactions, assessments"],
    contradictions: ["JSX extension is false; payload is a valid Microsoft Word DOCX with 38 tables."],
  },
  "module zero.md": {
    actualType: "lesson-instructor-react-reference",
    sourceFamily: "narration",
    instructions: ["Cached audio/video playback", "autoplay fallback", "word highlighting", "onEnded callback"],
    contradictions: ["Filename says Module Zero; payload is the LessonInstructor React component and contains no Module Zero curriculum."],
  },
  "VaultLoadingScreen-integration.md": {
    actualType: "authored-researched-crypto-modules-1-10",
    sourceFamily: "researched-crypto-1-10",
    instructions: ["Time-sensitive research log", "three lessons and ten questions per module", "interaction placement"],
    contradictions: ["Filename says loading-screen integration; payload is a complete researched ten-module crypto curriculum."],
  },
  "VaultLoadingScreen.jsx": {
    actualType: "vault-loading-screen-integration-guide",
    sourceFamily: "media-motion",
    instructions: ["Loading sequence behavior", "GSAP lifecycle", "GPU compositing"],
    contradictions: ["Filename says JSX component; payload is the Markdown integration guide."],
  },
};

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const clean = (value) => String(value ?? "").replace(/\r/g, "").trim();
const slugify = (value) => clean(value).toLowerCase()
  .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const stableUuid = (key) => {
  const hex = sha256(`iron-vault-scholar:${key}`).slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ["8", "9", "a", "b"][Number.parseInt(hex[16], 16) % 4];
  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex.slice(12, 16).join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20).join("")}`;
};
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function contentText(blocks) {
  return blocks.flatMap((block) => [
    block.title,
    block.heading,
    block.text,
    block.author,
    block.note,
    ...(block.items ?? []).map((item) => typeof item === "string" ? item : item.text),
    ...(block.steps ?? []).flatMap((step) => [step.label, step.heading, step.text]),
  ]).filter(Boolean).join("\n");
}

function narrationText(blocks) {
  return blocks.flatMap((block) => {
    switch (block.sourceType) {
      case "heading":
      case "body":
      case "callout":
        return [block.text];
      case "quote":
        return [`${block.text}${block.author ? ` — ${block.author}` : ""}`];
      case "vault":
        return [`${(block.title || "Vault secret.").replace(/^VAULT SECRET[: —-]*/i, "Vault secret. ")} ${block.text}`];
      case "action":
        return [`Your move: ${block.text}`];
      case "list":
        return [(block.items ?? []).join(". ")];
      default:
        return [];
    }
  }).filter(Boolean).join("\n\n");
}

function extractArrayLiteral(source, variableName) {
  const pattern = new RegExp(`(?:export\\s+)?const\\s+${variableName}\\s*=\\s*\\[`);
  const match = pattern.exec(source);
  if (!match) throw new Error(`Could not find ${variableName}`);
  const start = match.index + match[0].lastIndexOf("[");
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated ${variableName} array`);
}

function parseJsModules(source, variableName) {
  const literal = extractArrayLiteral(source, variableName);
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 2_000 });
}

function parseMarkdownModules(source) {
  const moduleMatches = [...source.matchAll(/^## MODULE (\d+) — (.+)$/gm)];
  const modules = [];
  for (let moduleOffset = 0; moduleOffset < moduleMatches.length; moduleOffset += 1) {
    const match = moduleMatches[moduleOffset];
    const end = moduleMatches[moduleOffset + 1]?.index ?? source.length;
    const section = source.slice(match.index, end);
    const moduleId = Number(match[1]);
    const lessonMatches = [...section.matchAll(/^### LESSON (\d+) — (.+)$/gm)];
    const quizMatch = new RegExp(`^### MODULE ${moduleId} QUIZ[^\\n]*$`, "m").exec(section);
    const lessons = lessonMatches.map((lessonMatch, lessonOffset) => {
      const lessonEnd = lessonMatches[lessonOffset + 1]?.index ?? quizMatch?.index ?? section.length;
      const body = section.slice(lessonMatch.index + lessonMatch[0].length, lessonEnd);
      const markers = [...body.matchAll(/^\*\*(QUOTE|HEADING|BODY|CALLOUT|ACTION|VAULT SECRET(?: — ([^*]+))?):\*\*(?:\s*(.*))?$/gm)];
      const blocks = markers.map((marker, markerOffset) => {
        const blockEnd = markers[markerOffset + 1]?.index ?? body.length;
        const payload = clean([marker[3], body.slice(marker.index + marker[0].length, blockEnd)]
          .filter(Boolean).join("\n").replace(/\n---\s*$/, ""));
        const typeLabel = marker[1];
        if (typeLabel === "QUOTE") {
          const lines = payload.split("\n").map(clean).filter(Boolean);
          const authorLine = lines.at(-1)?.startsWith("—") ? lines.pop() : "";
          return { type: "quote", text: lines.join("\n").replace(/^"|"$/g, ""), author: authorLine.replace(/^—\s*/, "") };
        }
        if (typeLabel.startsWith("VAULT SECRET")) {
          return { type: "vault", title: `VAULT SECRET — ${clean(marker[2])}`, text: payload };
        }
        return {
          type: { HEADING: "heading", BODY: "body", CALLOUT: "callout", ACTION: "action" }[typeLabel],
          text: payload,
        };
      });
      return { sourceIndex: Number(lessonMatch[1]), title: clean(lessonMatch[2]), content: blocks };
    });

    const quizText = quizMatch ? section.slice(quizMatch.index + quizMatch[0].length) : "";
    const questions = [];
    const questionMatches = [...quizText.matchAll(/^(\d+)\.\s+\*\*(.+?):\*\*$/gm)];
    for (let questionOffset = 0; questionOffset < questionMatches.length; questionOffset += 1) {
      const questionMatch = questionMatches[questionOffset];
      const questionEnd = questionMatches[questionOffset + 1]?.index ?? quizText.length;
      const questionBody = quizText.slice(questionMatch.index + questionMatch[0].length, questionEnd);
      const optionMatches = [...questionBody.matchAll(/^\s*-\s+([A-D])\)\s+(.+)$/gm)];
      const options = optionMatches.map((option) => clean(option[2].replace(/\s+—\s+\*\*CORRECT\*\*\s*$/, "")));
      const correct = optionMatches.findIndex((option) => /\*\*CORRECT\*\*/.test(option[2]));
      if (options.length) questions.push({ q: clean(questionMatch[2]), options, correct });
    }
    const meta = (name) => clean(new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.+)$`, "m").exec(section)?.[1]);
    modules.push({
      id: moduleId,
      title: clean(match[2]),
      subtitle: meta("Subtitle"),
      icon: meta("Icon"),
      tag: meta("Tag"),
      duration: meta("Duration"),
      xpReward: Number(meta("XP Reward")) || 0,
      lessons,
      quiz: questions,
    });
  }
  return modules;
}

const decodeXml = (value) => clean(value
  .replace(/<w:tab[^>]*\/>/g, "\t")
  .replace(/<w:br[^>]*\/>/g, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'"));

function parseDocx(path) {
  const documentXml = execFileSync("unzip", ["-p", path, "word/document.xml"], {
    encoding: "utf8",
    maxBuffer: 20_000_000,
  });
  const paragraphs = [...documentXml.matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)].map((match, index) => {
    const style = /<w:pStyle[^>]*w:val="([^"]+)"/.exec(match[0])?.[1] ?? null;
    return { index: index + 1, style, text: decodeXml(match[0]) };
  }).filter((paragraph) => paragraph.text);
  const tables = [...documentXml.matchAll(/<w:tbl(?:\s[^>]*)?>[\s\S]*?<\/w:tbl>/g)].map((tableMatch, tableIndex) => ({
    index: tableIndex + 1,
    rows: [...tableMatch[0].matchAll(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g)].map((rowMatch) =>
      [...rowMatch[0].matchAll(/<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g)].map((cellMatch) => decodeXml(cellMatch[0]))),
  }));
  return { paragraphs, tables };
}

function canvasBlueprints(canvas) {
  const pathways = canvas.tables[2].rows.slice(1).map(([title, learner, outcome]) => ({ title, learner, outcome }));
  const blockchainLessons = canvas.tables[5].rows.slice(1).map(([module, title, type]) => ({ module, title, type }));
  const defiWeeks = canvas.tables[8].rows.slice(1).map(([week, theme, topics, outcome]) => ({ week, theme, topics, outcome }));
  const developerInventory = canvas.tables[9].rows.slice(1).map(([title, duration, delivery]) => ({ title, duration, delivery }));
  const outlineCourseTitles = [
    "Web3 Foundations",
    "Blockchain Foundations",
    "Bitcoin Intensive",
    "Blockchain Development Decision",
    "Introduction to Blockchain Scrum Master",
    "Introduction to DevOps",
    "zk-SNARKs Essentials",
    "Solidity Smart Contract Developer (EVM)",
    "Smart Contract Security",
    "Understanding L1 & L2 Blockchains",
    "Ethereum Enterprise Strategist",
    "Ethereum DApp Developer",
    "Blockchain Architecture 101",
    "Blockchain Architecture 201",
    "Key Management",
    "Blockchain Security",
    "Blockchain Architecture 301",
    "Scrum Methods for Blockchain",
    "Architecting Solutions by Combining Agile Methodologies",
    "Scaling Agile Solutions for Blockchain to a Team-of-Teams",
  ];
  const outlinedCourses = [];
  for (let tableIndex = 10; tableIndex <= 29; tableIndex += 1) {
    const table = canvas.tables[tableIndex];
    outlinedCourses.push({
      tableIndex: table.index,
      courseTitle: outlineCourseTitles[tableIndex - 10],
      outlineType: table.rows[0]?.[1] === "Course" ? "course-sequence" : "module-sequence",
      items: table.rows.slice(1).map(([sequence, title]) => ({ sequence, title })),
    });
  }
  const aiSequence = canvas.tables[30].rows.slice(1).map(([sequence, title]) => ({ sequence, title }));
  const domainMap = canvas.tables[31].rows.slice(1).map(([domain, content]) => ({ domain, content }));
  const growthModules = canvas.tables[32].rows.slice(1).map(([module, lesson]) => ({ module, lesson }));
  const interactions = canvas.tables[35].rows.slice(1).map(([concept, interaction]) => ({ concept, interaction }));
  const register = canvas.tables[36].rows.slice(1).map(([title, pathwayPlacement]) => ({
    title,
    pathwayPlacement: pathwayPlacement.split(";").map(clean),
  }));
  return {
    documentStatus: "outline-blueprint-only",
    pathways,
    blockchainFoundations: { lessonsAndActivities: blockchainLessons },
    practicalDefiBootcamp: { weeks: defiWeeks },
    developerProgramInventory: developerInventory,
    outlinedCourses,
    aiPromptEngineerSequence: aiSequence,
    enterpriseRiskSecurityComplianceDomains: domainMap,
    web3GrowthCommunity: growthModules,
    interactionBlueprints: interactions,
    canonicalCourseRegister: register,
    assessmentStatements: canvas.paragraphs.filter((paragraph) =>
      /\b(assessment|quiz|exam|pass(?:ing)?|attempts?|mastery)\b/i.test(paragraph.text)),
    projectActivityCapstoneStatements: canvas.paragraphs.filter((paragraph) =>
      /\b(project|activity|exercise|assignment|lab|simulation|capstone|practice)\b/i.test(paragraph.text)),
    completeExtraction: "source-extractions/master-curriculum-canvas.complete.json",
  };
}

function blockType(block) {
  return {
    body: "text",
    action: "assignment",
    vault: "callout",
    sortgame: "sorting",
  }[block.type] ?? block.type;
}

function reviewFlags(text, sourceFamily) {
  const legal = /\b(tax|irs|act 60|offshore|citizenship|securit(?:y|ies)|regulat|legal|llc|trust|estate|accredited investor|ofac|gdpr|cpra|ccpa)\b/i.test(text);
  const owner = /\biron vault|ivt|token launch|token distribution|revenue.?shar|income distribution|presale|allocation\b/i.test(text);
  const timeSensitive = /\b(as of|currently|today|202[3-9]|market cap|aum|tps|apr|apy|rate|threshold|limit)\b/i.test(text);
  return {
    editorialStatus: "imported-unreviewed",
    publicationStatus: "unpublished",
    factReviewRequired: true,
    legalReviewRequired: legal,
    ownerApprovalRequired: owner,
    timeSensitiveReviewRequired: timeSensitive || sourceFamily === "researched-crypto-1-10",
  };
}

function normalizeFamily({ source, sourceHash, family, release, modules }) {
  return modules.map((module, moduleOffset) => {
    const moduleKey = `${family}:module:${module.id}`;
    const lessons = module.lessons.map((lesson, lessonOffset) => {
      const lessonIndex = lesson.sourceIndex ?? lessonOffset + 1;
      const lessonKey = `${moduleKey}:lesson:${lessonIndex}`;
      const blocks = (lesson.content ?? []).map((block, blockOffset) => ({
        ...structuredClone(block),
        id: stableUuid(`${lessonKey}:block:${blockOffset + 1}`),
        type: blockType(block),
        sourceType: block.type,
        sourceIndex: blockOffset + 1,
      }));
      const body = contentText(blocks);
      return {
        id: stableUuid(lessonKey),
        slug: `${slugify(module.title)}--${slugify(lesson.title)}`,
        title: lesson.title,
        sourcePath: join(SOURCE_DIR, source),
        sourceFilename: source,
        sourceHash,
        sourceKey: lessonKey,
        sourceFamily: family,
        sourceRelease: release,
        originalModuleIndex: module.id,
        originalLessonIndex: lessonIndex,
        contentHash: sha256(JSON.stringify(blocks)),
        titleHash: sha256(slugify(lesson.title)),
        blocks,
        narrationText: narrationText(blocks),
        review: reviewFlags(`${lesson.title}\n${body}`, family),
      };
    });
    return {
      id: stableUuid(moduleKey),
      slug: `${slugify(family)}--${slugify(module.title)}`,
      title: module.title,
      subtitle: module.subtitle ?? "",
      legacyIndex: module.id,
      legacyPosition: moduleOffset + 1,
      icon: module.icon ?? null,
      tag: module.tag ?? null,
      duration: module.duration ?? null,
      xpIntent: module.xpReward ?? null,
      sourcePath: join(SOURCE_DIR, source),
      sourceFilename: source,
      sourceHash,
      sourceKey: moduleKey,
      sourceFamily: family,
      sourceRelease: release,
      lessons,
      assessmentSource: module.quiz ?? [],
      review: reviewFlags(`${module.title}\n${lessons.map((item) => item.narrationText).join("\n")}`, family),
    };
  });
}

function canonicalPlacement(module) {
  const id = module.legacyIndex;
  const family = module.sourceFamily;
  if (family === "original-academy-unlocked") {
    return {
      1: ["Financial Systems", "Money and Wealth Foundations"],
      2: ["Financial Systems", "Economic Systems"],
      3: ["Financial Systems", "Traditional Finance Systems"],
      4: ["Blockchain and Digital Assets", "Crypto and Blockchain Foundations"],
      5: ["Blockchain and Digital Assets", "Digital Asset Foundations"],
      6: ["Iron Vault Foundations", "Iron Vault Orientation and Participation"],
    }[id];
  }
  if (family === "modules-7-12") {
    return {
      7: ["Financial Systems", "Debt Economy"],
      8: ["Sovereign Systems Lab", "Wealth Transfer and Estate Structures"],
      9: ["DeFi and Stablecoins", "DeFi and the Parallel Financial System"],
      10: ["Tokenization and Real-World Assets", "RWA Tokenization"],
      11: ["Enterprise and Growth", "Cash Flow and Scalable Income"],
      12: ["Sovereign Systems Lab", "Jurisdictions, Residency, and Exit Strategy"],
    }[id];
  }
  if (family === "modules-13-22") {
    if (id <= 14) return ["Blockchain and Digital Assets", module.title];
    if (id <= 20) return ["Financial Systems", module.title];
    return ["Sovereign Systems Lab", module.title];
  }
  if (family === "researched-crypto-1-10") {
    const pathway = id === 4 ? "DeFi and Stablecoins"
      : id === 10 ? "Tokenization and Real-World Assets"
        : "Blockchain and Digital Assets";
    return [pathway, "Crypto Systems and On-Chain Practice"];
  }
  return ["Unassigned", "Editorial review required"];
}

function titleTokens(title) {
  return new Set(slugify(title).split("-").filter((token) => token.length > 2));
}

function jaccard(left, right) {
  const a = titleTokens(left);
  const b = titleTokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / Math.max(1, new Set([...a, ...b]).size);
}

function buildDuplicateMap(sourceModules) {
  const lessons = sourceModules.flatMap((module) => module.lessons);
  const relationships = [];
  const groupedByTitle = Map.groupBy(lessons, (lesson) => slugify(lesson.title));
  for (const group of groupedByTitle.values()) {
    if (group.length < 2) continue;
    for (let index = 1; index < group.length; index += 1) {
      const primary = group.find((item) => item.sourceFamily === "original-academy-unlocked") ?? group[0];
      const candidate = group[index] === primary ? group[0] : group[index];
      relationships.push({
        primaryLessonId: primary.id,
        duplicateLessonId: candidate.id,
        relationship: primary.contentHash === candidate.contentHash ? "exact-duplicate" : "authored-variant",
        titleSimilarity: 1,
        contentHashesEqual: primary.contentHash === candidate.contentHash,
        decision: candidate.sourceFamily === "original-academy-gated"
          ? "Canonicalize to the more complete unlocked source body; retain gated variant in source records."
          : "Retain both pending editorial comparison.",
      });
    }
  }
  const canonicalCandidates = lessons.filter((lesson) => lesson.sourceFamily !== "original-academy-gated");
  for (let left = 0; left < canonicalCandidates.length; left += 1) {
    for (let right = left + 1; right < canonicalCandidates.length; right += 1) {
      const a = canonicalCandidates[left];
      const b = canonicalCandidates[right];
      if (slugify(a.title) === slugify(b.title)) continue;
      const similarity = jaccard(a.title, b.title);
      if (similarity >= 0.6) {
        relationships.push({
          primaryLessonId: a.id,
          duplicateLessonId: b.id,
          relationship: "possible-conceptual-overlap",
          titleSimilarity: Number(similarity.toFixed(3)),
          contentHashesEqual: false,
          decision: "Do not auto-merge; editorial review required.",
        });
      }
    }
  }
  return relationships;
}

function assessmentPackage(modules) {
  const assessments = [];
  const answerKeys = [];
  for (const module of modules) {
    if (!module.assessmentSource.length) continue;
    const assessmentKey = `${module.sourceKey}:assessment:module`;
    const assessmentId = stableUuid(assessmentKey);
    const questions = module.assessmentSource.map((question, questionOffset) => {
      const questionKey = `${assessmentKey}:question:${questionOffset + 1}`;
      const questionId = stableUuid(questionKey);
      const options = question.options.map((label, optionOffset) => ({
        id: stableUuid(`${questionKey}:option:${optionOffset + 1}`),
        label,
        sourceIndex: optionOffset,
      }));
      answerKeys.push({
        assessmentId,
        questionId,
        correctOptionId: options[question.correct]?.id ?? null,
        correctSourceIndex: question.correct,
        explanation: question.explanation ?? null,
        sourceKey: questionKey,
      });
      return {
        id: questionId,
        prompt: question.q,
        options,
        sourceIndex: questionOffset + 1,
        explanationAvailable: Boolean(question.explanation),
      };
    });
    assessments.push({
      id: assessmentId,
      slug: `${module.slug}--module-assessment`,
      title: `${module.title} — Module Assessment`,
      type: "module-assessment",
      moduleId: module.id,
      sourceFamily: module.sourceFamily,
      sourcePath: module.sourcePath,
      sourceHash: module.sourceHash,
      sourceKey: assessmentKey,
      sourceRelease: module.sourceRelease,
      questions,
      scoringAuthority: "server-only-when-integrated",
      answerKeyLocation: "answer-keys.private.json",
      publicationStatus: "unpublished",
    });
  }
  return { assessments, answerKeys };
}

function interactionInstances(modules) {
  const supported = new Set(["calculator", "simulation", "simulator", "scenario", "sorting", "sortgame", "reveal", "quiz", "diagram", "media"]);
  return modules.flatMap((module) => module.lessons.flatMap((lesson) =>
    lesson.blocks.filter((block) => supported.has(block.type) || supported.has(block.sourceType)).map((block) => ({
      id: block.id,
      lessonId: lesson.id,
      moduleId: module.id,
      type: block.type,
      sourceType: block.sourceType,
      definition: structuredClone(block),
      sourcePath: lesson.sourcePath,
      sourceKey: `${lesson.sourceKey}:block:${block.sourceIndex}`,
      status: "extracted-unmounted",
    }))));
}

function learningActivities(modules, blueprints) {
  const assignments = modules.flatMap((module) => module.lessons.flatMap((lesson) =>
    lesson.blocks.filter((block) => block.type === "assignment").map((block) => ({
      id: block.id,
      type: "assignment",
      title: block.title ?? "Lesson application",
      instructions: block.text,
      lessonId: lesson.id,
      moduleId: module.id,
      sourcePath: lesson.sourcePath,
      sourceHash: lesson.sourceHash,
      sourceKey: `${lesson.sourceKey}:block:${block.sourceIndex}`,
      publicationStatus: "unpublished",
    }))));
  return {
    assignments,
    authoredProjects: [],
    authoredCapstones: [],
    canvasActivityBlueprints: [
      ...blueprints.blockchainFoundations.lessonsAndActivities.filter((item) => !/lesson/i.test(item.type)),
      ...blueprints.interactionBlueprints,
      ...blueprints.projectActivityCapstoneStatements,
    ],
    finding: "The archive contains authored lesson assignments/actions, but project and capstone references in the Canvas are outline-level rather than complete authored bodies.",
  };
}

function canvasCoverageMap(blueprints, canonicalLessons) {
  const outlineItems = [
    ...blueprints.blockchainFoundations.lessonsAndActivities.map((item) => ({
      sourceSection: "Blockchain Foundations detailed lesson plan",
      outlineKey: `${item.module}:${item.title}`,
      title: item.title.replace(/^[A-Z]+-M\d+-Lesson-\d+:\s*/i, ""),
      type: item.type,
    })),
    ...blueprints.practicalDefiBootcamp.weeks.map((item) => ({
      sourceSection: "Eight-Week Practical DeFi & Web3 Finance Bootcamp",
      outlineKey: `week:${item.week}`,
      title: item.theme,
      type: "week",
    })),
    ...blueprints.outlinedCourses.flatMap((course) => course.items.map((item) => ({
      sourceSection: course.courseTitle,
      outlineKey: `${course.courseTitle}:${item.sequence}`,
      title: item.title,
      type: course.outlineType,
    }))),
    ...blueprints.aiPromptEngineerSequence.map((item) => ({
      sourceSection: "AI Prompt Engineer pathway",
      outlineKey: `ai:${item.sequence}`,
      title: item.title,
      type: /capstone|assessment/i.test(item.title) ? "capstone-assessment" : "course",
    })),
    ...blueprints.web3GrowthCommunity.map((item) => ({
      sourceSection: "Web3 Growth & Community",
      outlineKey: item.module,
      title: item.lesson,
      type: "module-outline",
    })),
  ];
  return outlineItems.map((outline) => {
    const ranked = canonicalLessons.map((lesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      sourceFamily: lesson.sourceFamily,
      titleSimilarity: jaccard(outline.title, lesson.title),
    })).sort((left, right) => right.titleSimilarity - left.titleSimilarity);
    const best = ranked[0];
    return {
      id: stableUuid(`canvas-outline:${outline.sourceSection}:${outline.outlineKey}`),
      ...outline,
      bestAuthoredLessonCandidate: best?.titleSimilarity >= 0.25
        ? { ...best, titleSimilarity: Number(best.titleSimilarity.toFixed(3)) }
        : null,
      reconciliationStatus: best?.titleSimilarity >= 0.75 ? "strong-title-match-review-body"
        : best?.titleSimilarity >= 0.5 ? "possible-overlap-review"
          : "outline-body-missing",
      publicationStatus: "unpublished",
    };
  });
}

function makeNarrationManifest(modules) {
  return Object.fromEntries(modules.flatMap((module) => module.lessons.map((lesson) => [lesson.id, {
    lessonId: lesson.id,
    sourceKey: lesson.sourceKey,
    text: lesson.narrationText,
    contentHash: sha256(lesson.narrationText),
    proposedAudioPath: `lesson-audio/${lesson.id}.mp3`,
    proposedTimingPath: `lesson-audio/${lesson.id}.words.json`,
    audioPresentInArchive: false,
    timingPresentInArchive: false,
    videoPresentInArchive: false,
  }])));
}

function sourceCountsFor(sourceName, allModules, canvas, rawText) {
  const modules = allModules.filter((module) => module.sourceFilename === sourceName);
  const lessons = modules.flatMap((module) => module.lessons);
  const assessments = modules.filter((module) => module.assessmentSource.length);
  const questions = assessments.reduce((sum, module) => sum + module.assessmentSource.length, 0);
  const answerKeys = assessments.reduce((sum, module) =>
    sum + module.assessmentSource.filter((question) => Number.isInteger(question.correct)).length, 0);
  const interactiveBlocks = lessons.flatMap((lesson) => lesson.blocks)
    .filter((block) => ["calculator", "simulation", "simulator", "scenario", "sorting", "sortgame", "reveal"].includes(block.type)
      || ["calculator", "simulator", "scenario", "sortgame", "reveal"].includes(block.sourceType)).length;
  const role = DETECTED_ROLES[sourceName];
  const isCanvas = role.sourceFamily === "master-canvas";
  return {
    modules: isCanvas ? canvas.tables.slice(10, 30).reduce((sum, table) => sum + Math.max(0, table.rows.length - 1), 0) : modules.length,
    lessons: isCanvas ? canvas.tables[5].rows.slice(1).filter((row) => /lesson/i.test(row[2])).length : lessons.length,
    assessments: isCanvas ? canvas.paragraphs.filter((p) => /assessment|quiz|exam/i.test(p.text)).length : assessments.length,
    questions,
    answerKeys,
    interactiveComponents: isCanvas ? Math.max(0, canvas.tables[35].rows.length - 1)
      : sourceName === "generate-lesson-audio.mjs" ? 5
      : sourceName === "module zero.md" ? 1
        : interactiveBlocks,
    narrationFeatures: /narrat|audio|ElevenLabs|timingSrc|audioSrc/i.test(rawText) ? 1 : 0,
    mediaFeatures: /video|media|loading|motion|GSAP|reduced-motion/i.test(rawText) ? 1 : 0,
  };
}

function withoutEmbeddedAnswerKeys(modules) {
  return modules.map(({ assessmentSource: _assessmentSource, ...module }) => ({
    ...module,
    lessons: module.lessons.map((lesson) => structuredClone(lesson)),
  }));
}

async function main() {
  await Promise.all([mkdir(DATA_DIR, { recursive: true }), mkdir(REPORT_DIR, { recursive: true }), mkdir(EXTRACT_DIR, { recursive: true })]);
  const buffers = Object.fromEntries(await Promise.all(SOURCE_FILES.map(async (name) => [name, await readFile(join(SOURCE_DIR, name))])));
  const texts = Object.fromEntries(Object.entries(buffers).map(([name, buffer]) => [name, buffer.toString("utf8")]));
  const hashes = Object.fromEntries(Object.entries(buffers).map(([name, buffer]) => [name, sha256(buffer)]));

  const canvas = parseDocx(join(SOURCE_DIR, "LessonInstructor.jsx"));
  const blueprints = canvasBlueprints(canvas);
  const familySpecs = [
    {
      source: "iron-vault-academy-unlocked (1).jsx",
      family: "original-academy-gated",
      release: "scholar-original-academy-gated-import",
      modules: parseJsModules(texts["iron-vault-academy-unlocked (1).jsx"], "MODULES"),
    },
    {
      source: "iron-vault-modules-13-22.jsx",
      family: "original-academy-unlocked",
      release: "scholar-original-academy-unlocked-import",
      modules: parseJsModules(texts["iron-vault-modules-13-22.jsx"], "MODULES"),
    },
    {
      source: "Iron_Vault_Master_Curriculum_Canvas.docx",
      family: "modules-7-12",
      release: "scholar-modules-7-12-import",
      modules: parseMarkdownModules(texts["Iron_Vault_Master_Curriculum_Canvas.docx"]),
    },
    {
      source: "iron-vault-modules-7-12.md",
      family: "modules-13-22",
      release: "scholar-modules-13-22-import",
      modules: parseJsModules(texts["iron-vault-modules-7-12.md"], "MODULES_13_22"),
    },
    {
      source: "VaultLoadingScreen-integration.md",
      family: "researched-crypto-1-10",
      release: "scholar-researched-crypto-import",
      modules: parseJsModules(texts["VaultLoadingScreen-integration.md"], "MODULES"),
    },
  ];

  const sourceModules = familySpecs.flatMap((spec) => normalizeFamily({ ...spec, sourceHash: hashes[spec.source] }));
  const duplicateMap = buildDuplicateMap(sourceModules);
  const duplicateIds = new Set(duplicateMap
    .filter((item) => item.relationship === "exact-duplicate" || item.relationship === "authored-variant")
    .filter((item) => sourceModules.flatMap((module) => module.lessons)
      .find((lesson) => lesson.id === item.duplicateLessonId)?.sourceFamily === "original-academy-gated")
    .map((item) => item.duplicateLessonId));
  const canonicalModules = sourceModules
    .filter((module) => module.sourceFamily !== "original-academy-gated")
    .map((module) => ({
      ...module,
      proposedPlacement: {
        pathway: canonicalPlacement(module)[0],
        course: canonicalPlacement(module)[1],
        module: module.title,
      },
      lessons: module.lessons.filter((lesson) => !duplicateIds.has(lesson.id)),
    }));
  const canonicalLessons = canonicalModules.flatMap((module) => module.lessons);
  const { assessments, answerKeys } = assessmentPackage(canonicalModules);
  const interactions = interactionInstances(canonicalModules);
  const activities = learningActivities(canonicalModules, blueprints);
  const canvasCoverage = canvasCoverageMap(blueprints, canonicalLessons);
  const narrationManifest = makeNarrationManifest(canonicalModules);

  const sourceRecords = SOURCE_FILES.map((name) => {
    const role = DETECTED_ROLES[name];
    return {
      sourcePath: join(SOURCE_DIR, name),
      sourceFilename: name,
      sourceKey: `scholar:${slugify(name)}`,
      sha256: hashes[name],
      bytes: buffers[name].length,
      extension: name.includes(".") ? name.slice(name.lastIndexOf(".")) : "",
      detectedContentType: role.actualType,
      sourceFamily: role.sourceFamily,
      counts: sourceCountsFor(name, sourceModules, canvas, texts[name]),
      implementationInstructionsFound: role.instructions,
      contradictions: role.contradictions,
      editorialStatus: "source-inventoried",
      publicationStatus: "unpublished",
    };
  });

  const releaseRecords = familySpecs.map((spec) => ({
    id: stableUuid(`release:${spec.release}`),
    slug: spec.release,
    sourceFilename: spec.source,
    sourceHash: hashes[spec.source],
    sourceFamily: spec.family,
    state: "immutable-import-package",
    publicationStatus: "unpublished",
    importedToDatabase: false,
  })).concat([{
    id: stableUuid("release:scholar-master-canvas-import"),
    slug: "scholar-master-canvas-import",
    sourceFilename: "LessonInstructor.jsx",
    sourceHash: hashes["LessonInstructor.jsx"],
    sourceFamily: "master-canvas",
    state: "immutable-blueprint-package",
    publicationStatus: "unpublished",
    importedToDatabase: false,
  }]);

  const capabilityMap = {
    packageStatus: "reference-only-unmounted",
    interactiveBlocks: [
      { type: "calculator", sourceType: "calculator", variants: ["compound", "streams"], behavior: "Range-input calculator with deterministic output and breakdown." },
      { type: "simulation", sourceType: "simulator", variants: ["bankroll"], behavior: "Client visualization of repeated probabilistic rounds; results are educational and not assessment-authoritative." },
      { type: "scenario", sourceType: "scenario", behavior: "Branching node graph with good/bad/neutral outcomes, explanations, restart, and optional continuation." },
      { type: "sorting", sourceType: "sortgame", behavior: "Assign each item to a declared bucket, check locally, display count, clear and retry." },
      { type: "reveal", sourceType: "reveal", behavior: "Progressively disclose ordered steps, optional note after completion, reset." },
    ],
    instructor: {
      sourceFilename: "module zero.md",
      sourcePath: join(SOURCE_DIR, "module zero.md"),
      sourceHash: hashes["module zero.md"],
      behaviors: ["audio or video element", "autoplay after learner gesture", "blocked-autoplay fallback", "play/pause/restart", "progress", "onEnded", "optional word highlight", "decorative amplitude proxy"],
      props: ["audioSrc", "timingSrc", "videoSrc", "title", "onEnded", "autoPlay", "accentColor"],
      integrationStatus: "not mounted",
    },
    narration: {
      generatorSourceFilename: "instructor-integration.md",
      guideSourceFilename: "iron-vault-academy-gated.jsx",
      generatorSourceHash: hashes["instructor-integration.md"],
      guideSourceHash: hashes["iron-vault-academy-gated.jsx"],
      provider: "ElevenLabs",
      execution: "offline/admin-only proposal",
      envNames: ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "ELEVENLABS_MODEL_ID", "LESSON_AUDIO_TIMESTAMPS", "LESSON_NARRATION_PATH", "LESSON_AUDIO_OUT"],
      cacheKeyInputs: ["narration text", "model id", "voice id", "timestamps flag"],
      outputTypes: ["audio/mpeg", "word timing JSON", "content-hash cache JSON"],
      runtimeTtsCallsAllowed: false,
      integrationStatus: "not wired",
    },
    motion: {
      directiveSourceFilename: "contentblock-interactive-extension.jsx",
      loadingGuideSourceFilename: "VaultLoadingScreen.jsx",
      directiveSourceHash: hashes["contentblock-interactive-extension.jsx"],
      loadingGuideSourceHash: hashes["VaultLoadingScreen.jsx"],
      ownership: { Lenis: "global smooth scroll", GSAP: "section scroll choreography", Motion: "discrete UI interactions" },
      accessibility: ["prefers-reduced-motion opacity-only fallback", "disable pointer parallax on touch", "avoid layout animation for reveals"],
      performance: ["transform/opacity for reveals", "no CLS", "GPU-composited transforms", "mobile performance check"],
      integrationStatus: "reference-only; no CSS or component imported",
    },
  };

  const mediaMap = {
    archiveAssetFiles: [],
    references: [
      { kind: "lesson-audio", template: "lesson-audio/{lessonUuid}.mp3", generated: false },
      { kind: "word-timing", template: "lesson-audio/{lessonUuid}.words.json", generated: false },
      { kind: "lesson-video", template: "lesson-video/{lessonUuid}.mp4", generated: false },
    ],
    lessonAssociations: Object.values(narrationManifest),
    finding: "The archive contains no MP3, timing JSON, MP4, image, or other lesson-media asset; it contains only source references and workflows.",
  };

  const placement = {
    status: "proposal-only",
    activeCurriculumChanged: false,
    pathways: Map.groupBy(canonicalModules, (module) => module.proposedPlacement.pathway),
  };
  placement.pathways = Object.fromEntries([...placement.pathways].map(([pathway, modules]) => [pathway,
    Object.fromEntries([...Map.groupBy(modules, (module) => module.proposedPlacement.course)].map(([course, courseModules]) => [course,
      courseModules.map((module) => ({ moduleId: module.id, title: module.title, sourceFamily: module.sourceFamily, legacyIndex: module.legacyIndex }))]))]));

  const missingContent = [
    {
      key: "module-zero-authored-curriculum",
      severity: "blocking-for-module-zero-claim",
      finding: "No authored Module Zero curriculum body exists in the archive. The file named module zero.md is the LessonInstructor component.",
      action: "Request the intended Module Zero source or later author it under a separate approved gap-fill phase.",
    },
    {
      key: "canvas-outline-bodies",
      severity: "expected-blueprint-gap",
      finding: "Master Canvas course/module rows are outlines, not complete lesson bodies.",
      affectedOutlineItems: blueprints.blockchainFoundations.lessonsAndActivities.length
        + blueprints.practicalDefiBootcamp.weeks.length
        + blueprints.outlinedCourses.reduce((sum, course) => sum + course.items.length, 0)
        + blueprints.aiPromptEngineerSequence.length
        + blueprints.web3GrowthCommunity.length,
      action: "Do not publish; expand only in a separately approved gap-authoring phase after mapping against canonical authored lessons.",
    },
    {
      key: "assessment-explanations",
      severity: "quality-gap",
      finding: "Archive module questions generally include correct options but no answer explanations.",
      affectedQuestions: answerKeys.filter((key) => !key.explanation).length,
      action: "Author explanations during later editorial assessment completion.",
    },
    {
      key: "lesson-media-assets",
      severity: "capability-gap",
      finding: "No audio, timing, video, image, or diagram asset files are present.",
      action: "Generate approved narration offline later; source or create media only after editorial approval.",
    },
    {
      key: "source-links",
      severity: "fact-review-gap",
      finding: "Many factual claims name sources or tools but lack structured source URLs and review dates.",
      action: "Perform fact/legal review and attach primary-source links before publication.",
    },
  ];

  const validation = {
    sourceFilesExpected: SOURCE_FILES.length,
    sourceFilesRead: sourceRecords.length,
    allSourceHashesPresent: sourceRecords.every((source) => /^[a-f0-9]{64}$/.test(source.sha256)),
    docxParagraphsExtracted: canvas.paragraphs.length,
    docxTablesExtracted: canvas.tables.length,
    sourceModules: sourceModules.length,
    sourceLessonsIncludingVariants: sourceModules.flatMap((module) => module.lessons).length,
    canonicalModules: canonicalModules.length,
    canonicalLessons: canonicalLessons.length,
    sourceAssessments: sourceModules.filter((module) => module.assessmentSource.length).length,
    canonicalAssessments: assessments.length,
    canonicalQuestions: assessments.reduce((sum, assessment) => sum + assessment.questions.length, 0),
    answerKeys: answerKeys.length,
    answerKeysComplete: answerKeys.every((key) => key.correctOptionId),
    interactionInstances: interactions.length,
    narrationAssociations: Object.keys(narrationManifest).length,
    duplicateRelationships: duplicateMap.length,
    excludedGatedVariantLessons: duplicateIds.size,
    applicationFilesChangedByBuilder: 0,
    databaseChangedByBuilder: false,
    activeReleaseChangedByBuilder: false,
    publicationState: "unpublished-offline-package",
  };

  const outputs = {
    "sources.json": sourceRecords,
    "source-releases.json": releaseRecords,
    "curriculum-source-records.json": withoutEmbeddedAnswerKeys(sourceModules),
    "curriculum-canonical.json": withoutEmbeddedAnswerKeys(canonicalModules),
    "assessments.json": assessments,
    "answer-keys.private.json": answerKeys,
    "interactions.json": interactions,
    "learning-activities.json": activities,
    "capability-map.json": capabilityMap,
    "media-audio-map.json": mediaMap,
    "narration-manifest.json": narrationManifest,
    "duplicate-reconciliation-map.json": duplicateMap,
    "proposed-placement.json": placement,
    "missing-content.json": missingContent,
    "canvas-blueprints.json": blueprints,
    "canvas-coverage-map.json": canvasCoverage,
    "validation.json": validation,
    "package-manifest.json": {
      schemaVersion: "1.0.0",
      packageType: "iron-vault-scholar-offline-normalization",
      publicationStatus: "unpublished",
      databaseImportPerformed: false,
      activeReleaseChanged: false,
      privacy: {
        publicSafeCurriculumFiles: ["curriculum-canonical.json", "curriculum-source-records.json", "assessments.json"],
        serverOnlyFiles: ["answer-keys.private.json"],
      },
      identity: {
        runtimeIds: "deterministic UUIDs derived from source-family keys",
        legacyIndexes: "provenance metadata only",
      },
      files: [
        "sources.json",
        "source-releases.json",
        "curriculum-source-records.json",
        "curriculum-canonical.json",
        "assessments.json",
        "answer-keys.private.json",
        "interactions.json",
        "learning-activities.json",
        "capability-map.json",
        "media-audio-map.json",
        "narration-manifest.json",
        "duplicate-reconciliation-map.json",
        "proposed-placement.json",
        "missing-content.json",
        "canvas-blueprints.json",
        "canvas-coverage-map.json",
        "validation.json",
        "package-manifest.json",
      ],
    },
  };
  await Promise.all(Object.entries(outputs).map(([name, value]) => writeFile(join(DATA_DIR, name), json(value))));
  await writeFile(join(EXTRACT_DIR, "master-curriculum-canvas.complete.json"), json(canvas));

  const inventoryRows = sourceRecords.map((source) =>
    `| ${source.sourceFilename} | \`${source.sha256}\` | ${source.detectedContentType} | ${source.counts.modules} | ${source.counts.lessons} | ${source.counts.assessments} | ${source.counts.questions} | ${source.counts.answerKeys} | ${source.counts.interactiveComponents} |`).join("\n");
  const inventoryReport = `# Scholar Archive Source Inventory

Generated from all ${sourceRecords.length} archive files. Counts are detected from actual payloads, not filename assumptions.

| Source filename | SHA-256 | Detected content | Modules/outlines | Lessons | Assessments | Questions | Keys | Interactive components |
|---|---|---:|---:|---:|---:|---:|---:|---:|
${inventoryRows}

## Filename/content contradictions

${sourceRecords.flatMap((source) => source.contradictions.map((item) => `- **${source.sourceFilename}:** ${item}`)).join("\n")}

## Complete DOCX extraction

The valid Word document is \`sex/LessonInstructor.jsx\`, despite its extension. The package extracted ${canvas.paragraphs.length} non-empty paragraphs and all ${canvas.tables.length} tables into \`source-extractions/master-curriculum-canvas.complete.json\`. The file named \`Iron_Vault_Master_Curriculum_Canvas.docx\` is actually UTF-8 Markdown containing complete Modules 7–12.
`;
  const reconciliationReport = `# Scholar Archive Reconciliation

## Package state

- Offline and unpublished.
- No database import or schema migration.
- No active curriculum merge.
- No Academy UI, member route, shell, navigation, CSS, or layout changes.
- No build, PM2 restart, staging change, or deployment.

## Counts

- Source curriculum modules, including the gated/unlocked variants: ${validation.sourceModules}
- Source lessons, including variants: ${validation.sourceLessonsIncludingVariants}
- Canonical modules after excluding the shorter gated presentation variant: ${validation.canonicalModules}
- Canonical full lesson bodies: ${validation.canonicalLessons}
- Canonical module assessments: ${validation.canonicalAssessments}
- Canonical questions and server-private answer-key records: ${validation.canonicalQuestions}
- Extracted interactive instances: ${validation.interactionInstances}
- Narration associations: ${validation.narrationAssociations}
- Duplicate/overlap relationships: ${validation.duplicateRelationships}

## Reconciliation decisions

- The unlocked original Academy source is the canonical body for modules 1–6 because it is generally the more complete authored variant. The gated body remains intact in \`curriculum-source-records.json\`.
- Modules 7–12 are parsed from the text payload falsely named \`Iron_Vault_Master_Curriculum_Canvas.docx\`.
- Modules 13–22 are parsed from the source falsely named \`iron-vault-modules-7-12.md\`.
- The researched crypto modules 1–10 are retained as a separate course family rather than overwriting the original Academy’s colliding legacy indexes.
- Canvas items remain blueprints. They are represented, mapped, and explicitly not promoted to finished lessons.
- Possible conceptual overlaps are never auto-merged.

## Review boundary

Every normalized entity is unpublished. Fact review is required on every authored lesson; legal review and owner approval are flagged heuristically and must be confirmed by humans before any later import or publication.
`;
  await writeFile(join(REPORT_DIR, "SOURCE-INVENTORY.md"), inventoryReport);
  await writeFile(join(REPORT_DIR, "RECONCILIATION.md"), reconciliationReport);

  const readme = `# Iron Vault Scholar Archive — Normalized Source Package

This is an offline content-and-capability package built from every file in \`/opt/iron-vault/sex\`. It deliberately contains no application UI, route, CSS, layout, database migration, active-release merge, or deployment change.

## Important boundaries

- Publication state: **unpublished**
- Database import: **not performed**
- Active curriculum release: **unchanged**
- Answer keys: isolated in \`data/answer-keys.private.json\`; do not send this file to browsers
- Canvas outlines: represented as blueprints, never labeled as finished lessons
- Old JSX presentation and CSS: not copied or mounted

## Integration-ready data

- \`data/curriculum-canonical.json\`: ${validation.canonicalLessons} unique, complete authored lesson bodies with stable UUIDs, slugs, blocks, provenance, and proposed placement
- \`data/curriculum-source-records.json\`: all source variants, including the excluded gated duplicates
- \`data/assessments.json\`: questions/options without correct answers
- \`data/answer-keys.private.json\`: private correct-option IDs and explanation gaps
- \`data/interactions.json\`: extracted interaction instances
- \`data/learning-activities.json\`: authored assignments plus Canvas activity/project/capstone blueprints
- \`data/capability-map.json\`: reusable behavior contracts for interactions, instructor, narration, media, and motion
- \`data/media-audio-map.json\`: asset references and absence findings
- \`data/narration-manifest.json\`: narration text and proposed offline asset associations per lesson UUID
- \`data/duplicate-reconciliation-map.json\`: exact, variant, and possible-overlap relationships
- \`data/proposed-placement.json\`: proposed pathway/course/module placement only
- \`data/canvas-blueprints.json\`: Canvas pathways, courses, outlines, bootcamp, AI, developer, security, enterprise, growth, assessments, and interaction blueprints
- \`data/canvas-coverage-map.json\`: every detailed Canvas outline item mapped to its best authored-lesson candidate or marked body-missing
- \`data/missing-content.json\`: missing bodies, explanations, media, Module Zero, and sourcing gaps
- \`data/sources.json\`: byte counts, SHA-256, actual content types, counts, instructions, and contradictions
- \`source-extractions/master-curriculum-canvas.complete.json\`: complete paragraph/table extraction of the real DOCX

## Validation

See \`data/validation.json\` and the reports in \`reports/\`. Rebuild deterministically with:

\`\`\`bash
node scholar-archive-package/tools/build-package.mjs
\`\`\`

The generator uses Node built-ins only and performs no network or database access.
`;
  await writeFile(join(PACKAGE_DIR, "README.md"), readme);
  console.log(json(validation));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
