import { NextRequest, NextResponse } from 'next/server'

import { getMemberAccessScope, requireMemberAccess } from '@/lib/server/member-access'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import {
  getCanonicalSolanaWalletForUser,
  getIvtTokenBalance,
  getIvtTokenMintAddress,
  getSolanaExplorerTokenMintUrl,
  getSolanaExplorerTxUrl,
  getSolanaExplorerWalletUrl,
} from '@/lib/server/ivt-solana-wallet'

const NO_ACTIVE_POLICY_MESSAGE =
  'Reward programs are configured separately from Academy completion. No active reward policy is currently assigned to this account.'

type RewardProgramState =
  | 'pending_review'
  | 'approved'
  | 'fulfilled'
  | 'not_currently_eligible'

function mapAccessErrorToStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : ''
  if (message.startsWith('Unauthorized:')) return 401
  if (message.startsWith('Forbidden:')) return 403
  return 500
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
}

function assignedRewardProgram(metadata: Record<string, unknown> | undefined) {
  const candidate = metadata?.reward_policy
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null
  const policy = candidate as Record<string, unknown>
  const id = typeof policy.id === 'string' ? policy.id.trim() : ''
  const name = typeof policy.name === 'string' ? policy.name.trim() : ''
  const state = policy.state
  const validStates = new Set<RewardProgramState>([
    'pending_review',
    'approved',
    'fulfilled',
    'not_currently_eligible',
  ])

  if (!id || !name || !validStates.has(state as RewardProgramState)) return null
  return {
    id,
    name,
    state: state as RewardProgramState,
    requirements: stringArray(policy.requirements),
    progress: policy.progress && typeof policy.progress === 'object' && !Array.isArray(policy.progress)
      ? policy.progress as Record<string, unknown>
      : null,
  }
}

export async function GET(req: NextRequest) {
  let privyUserId: string
  let walletAddress: string | null
  let entitlementMetadata: Record<string, unknown> | undefined

  try {
    const access = await requireMemberAccess(req)
    privyUserId = access.auth.privyUserId
    walletAddress = access.auth.walletAddress
    entitlementMetadata = access.entitlement?.metadata
  } catch (error: unknown) {
    const status = mapAccessErrorToStatus(error)
    const message = error instanceof Error ? error.message : 'Failed to verify member access'
    return NextResponse.json({ error: message }, { status })
  }

  try {
    const scope = await getMemberAccessScope(req)
    const [
      profileResult,
      milestonesResult,
      payoutJobsResult,
      transactionsResult,
    ] = await Promise.all([
      getSupabaseAdmin()
        .from('iv_user_profiles')
        .select('wallet_address')
        .eq('privy_user_id', privyUserId)
        .maybeSingle<{ wallet_address: string | null }>(),
      getSupabaseAdmin()
        .from('iv_reward_milestones')
        .select('milestone_number, module_start, module_end, status, eligible_at')
        .eq('privy_user_id', privyUserId)
        .order('milestone_number', { ascending: true }),
      getSupabaseAdmin()
        .from('iv_payout_jobs')
        .select('milestone_number, reward_track, access_type, module_number, entitlement_id, status, amount_raw, token_mint, attempts, last_error')
        .eq('privy_user_id', privyUserId)
        .order('created_at', { ascending: false }),
      getSupabaseAdmin()
        .from('iv_payout_transactions')
        .select('milestone_number, reward_track, access_type, module_number, entitlement_id, signature, status, confirmed_at')
        .eq('privy_user_id', privyUserId)
        .order('created_at', { ascending: false }),
    ])

    const errors = [
      profileResult.error,
      milestonesResult.error,
      payoutJobsResult.error,
      transactionsResult.error,
    ].filter(Boolean)
    if (errors.length > 0) {
      throw new Error(errors[0]?.message ?? 'Failed to load reward status')
    }

    const solanaWallet = await getCanonicalSolanaWalletForUser(privyUserId)
    const balance = await getIvtTokenBalance(solanaWallet.walletAddress)
    const rewardProgram = assignedRewardProgram(entitlementMetadata)

    return NextResponse.json({
      rewardProgram: rewardProgram ?? {
        id: null,
        name: null,
        state: 'not_currently_eligible',
        requirements: [],
        progress: null,
        message: NO_ACTIVE_POLICY_MESSAGE,
      },
      curriculum: {
        releaseId: scope.releaseId,
        releaseVersion: scope.releaseVersion,
      },
      walletAddress: solanaWallet.walletAddress,
      evmWalletAddress: walletAddress?.startsWith('0x') ? walletAddress : null,
      solanaIvtWalletAddress: solanaWallet.walletAddress,
      solanaIvtWalletSource: solanaWallet.source,
      solanaExplorerWalletUrl: getSolanaExplorerWalletUrl(solanaWallet.walletAddress),
      ivtTokenMint: getIvtTokenMintAddress(),
      ivtTokenMintExplorerUrl: getSolanaExplorerTokenMintUrl(),
      ivtTokenBalance: balance,
      legacyRewardHistory: {
        milestones: milestonesResult.data ?? [],
        payoutJobs: payoutJobsResult.data ?? [],
        transactions: (transactionsResult.data ?? []).map((row) => ({
          ...row,
          explorerUrl: getSolanaExplorerTxUrl((row as { signature: string }).signature),
        })),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load reward status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
