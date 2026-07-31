import { config as loadEnv } from "dotenv";
import { Pool } from "pg";

loadEnv({ path: "/opt/iron-vault/secrets/database.env", override: false });

const releaseVersion = "scholar-archive-import-v1";
const root = `/academy/preview/${releaseVersion}`;
const baseUrl = process.env.SCHOLAR_VERIFY_BASE_URL?.replace(/\/$/, "");
const token = process.env.SCHOLAR_ADMIN_TOKEN;
const cookie = process.env.SCHOLAR_ADMIN_COOKIE;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, application_name: "scholar-route-verifier" });

type Entity = { kind: string; slug: string; path: string };

async function loadEntities(): Promise<Entity[]> {
  const result = await pool.query<{ kind: string; slug: string }>(
    `
      SELECT 'pathways' AS kind, pathways.slug
      FROM pathways INNER JOIN curriculum_releases ON curriculum_releases.id = pathways.release_id
      WHERE curriculum_releases.version = $1 AND pathways.access_class = 'internal'
      UNION ALL
      SELECT 'courses', courses.slug
      FROM courses INNER JOIN pathways ON pathways.id = courses.pathway_id
      INNER JOIN curriculum_releases ON curriculum_releases.id = pathways.release_id
      WHERE curriculum_releases.version = $1 AND courses.access_class = 'internal'
      UNION ALL
      SELECT 'modules', curriculum_modules.slug
      FROM curriculum_modules INNER JOIN courses ON courses.id = curriculum_modules.course_id
      INNER JOIN pathways ON pathways.id = courses.pathway_id
      INNER JOIN curriculum_releases ON curriculum_releases.id = pathways.release_id
      WHERE curriculum_releases.version = $1 AND curriculum_modules.access_class = 'internal'
      UNION ALL
      SELECT 'lessons', lessons.slug
      FROM lessons INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
      INNER JOIN courses ON courses.id = curriculum_modules.course_id
      INNER JOIN pathways ON pathways.id = courses.pathway_id
      INNER JOIN curriculum_releases ON curriculum_releases.id = pathways.release_id
      WHERE curriculum_releases.version = $1 AND lessons.access_class = 'internal'
      UNION ALL
      SELECT 'assessments', assessments.slug
      FROM assessments INNER JOIN curriculum_releases ON curriculum_releases.id = assessments.release_id
      WHERE curriculum_releases.version = $1 AND assessments.audience = 'internal'
      ORDER BY kind, slug
    `,
    [releaseVersion],
  );
  return result.rows.map((row) => ({ ...row, path: `${root}/${row.kind}/${encodeURIComponent(row.slug)}` }));
}

async function verify() {
  const entities = await loadEntities();
  const expected = { pathways: 7, courses: 25, modules: 32, lessons: 138, assessments: 32 };
  const counts = Object.fromEntries(Object.keys(expected).map((kind) => [kind, entities.filter((entity) => entity.kind === kind).length]));
  for (const [kind, count] of Object.entries(expected)) {
    if (counts[kind] !== count) throw new Error(`${kind}: expected ${count}, found ${counts[kind]}`);
    const paths = entities.filter((entity) => entity.kind === kind).map((entity) => entity.path);
    if (new Set(paths).size !== count) throw new Error(`${kind}: canonical slugs do not produce ${count} unique routes`);
  }
  console.log(`Canonical routes: ${JSON.stringify(counts)}`);
  if (!baseUrl) {
    console.log("Database route manifest verified. Set SCHOLAR_VERIFY_BASE_URL plus SCHOLAR_ADMIN_TOKEN or SCHOLAR_ADMIN_COOKIE for authorized HTTP verification.");
    return;
  }
  if (!token && !cookie) throw new Error("Authorized HTTP verification requires SCHOLAR_ADMIN_TOKEN or SCHOLAR_ADMIN_COOKIE");
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (cookie) headers.cookie = cookie;
  const routes = [{ kind: "home", slug: releaseVersion, path: root }, ...entities];
  const failures: Array<{ kind: string; slug: string; status: number; url: string }> = [];
  let completed = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (completed < routes.length) {
      const route = routes[completed++];
      const url = `${baseUrl}${route.path}`;
      const response = await fetch(url, { headers, redirect: "manual" });
      if (response.status !== 200) failures.push({ kind: route.kind, slug: route.slug, status: response.status, url });
    }
  });
  await Promise.all(workers);
  if (failures.length) {
    for (const failure of failures) console.error(`BROKEN ${failure.kind} ${failure.slug}: HTTP ${failure.status} ${failure.url}`);
    throw new Error(`${failures.length} Scholar route(s) failed`);
  }
  console.log(`HTTP 200: home 1/1, pathways 7/7, courses 25/25, modules 32/32, lessons 138/138, assessments 32/32`);
}

try { await verify(); } finally { await pool.end(); }
