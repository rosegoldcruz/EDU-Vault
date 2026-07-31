"use server"

import { createHash } from "node:crypto"
import { getSupabaseAdmin } from "@/lib/server/supabase-admin"

type LessonProgressRow = {
  module_index: number
  lesson_index: number
}

type QuizResultRow = {
  module_index: number
  score: number
  passed: boolean
  attempted_at: string
}

function getStableMemberEmail(privyUserId: string) {
  const digest = createHash("sha1").update(`iron-vault-member:${privyUserId}`).digest("hex")
  return `privy_${digest.slice(0, 24)}@member.ironvault.local`
}

async function findEducationAuthUserId(privyUserId: string): Promise<string | null> {
  const memberEmail = getStableMemberEmail(privyUserId)
  const { data, error } = await getSupabaseAdmin().auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (error) throw new Error(error.message)
  return data?.users.find((user) => user.email === memberEmail)?.id ?? null
}

export async function resolveEducationAuthUserId(privyUserId: string) {
  const memberEmail = getStableMemberEmail(privyUserId)

  const { data: createdUserData, error: createUserError } = await getSupabaseAdmin().auth.admin.createUser({
    email: memberEmail,
    email_confirm: true,
    user_metadata: {
      external_user_id: privyUserId,
      provider: "privy",
    },
  })

  let resolvedUserId = createdUserData?.user?.id

  if (!resolvedUserId) {
    const alreadyExists = createUserError?.message?.toLowerCase().includes("already")

    if (!alreadyExists) {
      throw new Error(createUserError?.message ?? "Failed to resolve member identity")
    }

    const { data: usersData, error: listUsersError } = await getSupabaseAdmin().auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listUsersError) {
      throw new Error(listUsersError.message)
    }

    const existingUser = usersData?.users.find((user) => user.email === memberEmail)
    if (!existingUser?.id) {
      throw new Error("Failed to find existing member auth user")
    }

    resolvedUserId = existingUser.id
  }

  const { error: profileError } = await getSupabaseAdmin().from("profiles").upsert(
    { id: resolvedUserId },
    { onConflict: "id", ignoreDuplicates: true },
  )

  if (profileError) {
    throw new Error(profileError.message)
  }

  return resolvedUserId
}

async function readProgress(resolvedUserId: string) {
  const admin = getSupabaseAdmin()
  const [{ data: lessons, error: lessonsError }, { data: quizRows, error: quizError }] = await Promise.all([
    admin
      .from("progress")
      .select("module_index, lesson_index")
      .eq("user_id", resolvedUserId),
    admin
      .from("quiz_results")
      .select("module_index, score, passed, attempted_at")
      .eq("user_id", resolvedUserId)
      .order("attempted_at", { ascending: false }),
  ])

  if (lessonsError) {
    throw new Error(lessonsError.message)
  }

  if (quizError) {
    throw new Error(quizError.message)
  }

  const latestQuizByModule = new Map<number, Omit<QuizResultRow, "attempted_at">>()

  for (const row of (quizRows ?? []) as QuizResultRow[]) {
    if (!latestQuizByModule.has(row.module_index)) {
      latestQuizByModule.set(row.module_index, {
        module_index: row.module_index,
        score: row.score,
        passed: row.passed,
      })
    }
  }

  return {
    lessons: (lessons ?? []) as LessonProgressRow[],
    quizResults: Array.from(latestQuizByModule.values()),
  }
}

export async function getProgress(privyUserId: string) {
  return readProgress(await resolveEducationAuthUserId(privyUserId))
}

export async function getExistingProgress(privyUserId: string) {
  const resolvedUserId = await findEducationAuthUserId(privyUserId)
  if (!resolvedUserId) {
    return { lessons: [] as LessonProgressRow[], quizResults: [] as Array<Omit<QuizResultRow, "attempted_at">> }
  }
  return readProgress(resolvedUserId)
}

export async function markLessonComplete(privyUserId: string, moduleIndex: number, lessonIndex: number) {
  const resolvedUserId = await resolveEducationAuthUserId(privyUserId)

  const { error } = await getSupabaseAdmin().from("progress").upsert(
    {
      user_id: resolvedUserId,
      module_index: moduleIndex,
      lesson_index: lessonIndex,
    },
    {
      onConflict: "user_id,module_index,lesson_index",
      ignoreDuplicates: true,
    },
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function saveQuizResult(privyUserId: string, moduleIndex: number, score: number, passed: boolean) {
  const resolvedUserId = await resolveEducationAuthUserId(privyUserId)

  const { error } = await getSupabaseAdmin().from("quiz_results").insert({
    user_id: resolvedUserId,
    module_index: moduleIndex,
    score,
    passed,
  })

  if (error) {
    throw new Error(error.message)
  }
}
