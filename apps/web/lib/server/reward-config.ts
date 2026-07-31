export type RewardProductTier = 'INTERNAL_TEST' | 'ENTRY' | 'FOUNDATION' | 'BUILDER_ACCELERATOR' | 'FOUNDER_ELITE'

export type RewardTierMetadata = {
  product_key?: unknown
  productKey?: unknown
  legacyTier?: unknown
  legacy_tier?: unknown
  tier?: unknown
  paymentTier?: unknown
  payment_tier?: unknown
  access_type?: unknown
  reward_track?: unknown
  internal_test?: unknown
  reward_amounts_raw?: unknown
  single_module_reward_amount_raw?: unknown
}

export type RewardResolutionContext = {
  rewardTrack: 'full_academy' | 'single_module'
  accessType: 'all_modules' | 'single_module'
  milestoneNumber?: number
  moduleNumber?: number
}

type RewardConfig = {
  network: string
  payoutWorkerEnabled: boolean
  payoutDryRun: boolean
  payoutSafeTestOnly: boolean
  payoutSafeTestModuleNumber: number | null
  maxPayoutsPerRun: number
  tokenMintAddress: string
  rewardWalletPublicKey: string
  solanaRpcUrl: string
}

type RewardTransferConfig = RewardConfig & {
  rewardWalletSecretKey: string
}

function readEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function readOptionalEnv(name: string, fallback: string): string {
  const value = process.env[name]
  if (!value) return fallback
  return value
}

function parseBoolean(value: string): boolean {
  return value.trim().toLowerCase() === 'true'
}

function parsePositiveInteger(name: string, value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: expected a positive integer`)
  }
  return parsed
}

function parseOptionalNonNegativeInteger(name: string): number | null {
  const value = process.env[name]
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name}: expected a non-negative integer`)
  }
  return parsed
}

function assertRawAmount(name: string, value: string): string {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid ${name}: expected raw integer amount string`)
  }
  if (trimmed === '0') {
    throw new Error(`Invalid ${name}: amount must be greater than zero`)
  }
  return trimmed
}

function normalizeMetadataString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeMetadataBoolean(value: unknown): boolean {
  return value === true || (typeof value === 'string' && value.trim().toLowerCase() === 'true')
}

function normalizeTierToken(value: unknown): string | null {
  const normalized = normalizeMetadataString(value)
  return normalized ? normalized.toUpperCase().replace(/[\s-]+/g, '_') : null
}

function getNormalizedTierKey(metadata?: RewardTierMetadata | null): string | null {
  if (!metadata) return null

  const candidates = [
    metadata.product_key,
    metadata.productKey,
    metadata.legacyTier,
    metadata.legacy_tier,
    metadata.paymentTier,
    metadata.payment_tier,
    metadata.tier,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeTierToken(candidate)
    if (normalized) return normalized
  }

  return null
}

function mapTierTokenToProductTier(value: unknown): RewardProductTier | null {
  const token = normalizeTierToken(value)
  if (!token) return null

  if (token === 'INTERNAL_TEST' || token === 'TEST_MODULE' || token === 'SINGLE_MODULE_TEST') return 'INTERNAL_TEST'
  if (token === 'ENTRY' || token === 'MODULE' || token === 'SINGLE_MODULE') return 'ENTRY'
  if (token === 'FOUNDATION' || token === 'STARTER') return 'FOUNDATION'
  if (token === 'BUILDER_ACCELERATOR' || token === 'BUILDER' || token === 'ACCELERATOR') return 'BUILDER_ACCELERATOR'
  if (token === 'FOUNDER_ELITE' || token === 'FOUNDER' || token === 'ELITE') return 'FOUNDER_ELITE'

  return null
}

function getMetadataAccessType(metadata?: RewardTierMetadata | null): string | null {
  return normalizeMetadataString(metadata?.access_type)
}

function getMetadataRewardTrack(metadata?: RewardTierMetadata | null): string | null {
  return normalizeMetadataString(metadata?.reward_track)
}

function hasRewardShape(
  metadata: RewardTierMetadata | null | undefined,
  context: RewardResolutionContext,
): boolean {
  return getMetadataAccessType(metadata) === context.accessType
    && getMetadataRewardTrack(metadata) === context.rewardTrack
}

function buildResolutionError(
  scope: 'full_academy' | 'single_module',
  metadata: RewardTierMetadata | null | undefined,
  context: RewardResolutionContext,
): Error {
  const details = [
    `reward_track=${context.rewardTrack}`,
    `access_type=${context.accessType}`,
    context.milestoneNumber === undefined ? null : `milestone_number=${context.milestoneNumber}`,
    context.moduleNumber === undefined ? null : `module_number=${context.moduleNumber}`,
    `normalized_tier_key=${getNormalizedTierKey(metadata) ?? 'missing'}`,
  ].filter(Boolean).join(' ')

  return new Error(
    `Missing or unsupported product tier for ${scope} reward amount resolution. Refusing payout job creation. ${details}`,
  )
}

export function resolveRewardProductTier(metadata?: RewardTierMetadata | null): RewardProductTier | null {
  if (!metadata) return null

  if (normalizeMetadataBoolean(metadata.internal_test)) return 'INTERNAL_TEST'

  const directCandidates = [
    metadata.product_key,
    metadata.productKey,
    metadata.legacyTier,
    metadata.legacy_tier,
  ]

  for (const candidate of directCandidates) {
    const tier = mapTierTokenToProductTier(candidate)
    if (tier) return tier
  }

  const paymentTier = mapTierTokenToProductTier(metadata.paymentTier ?? metadata.payment_tier)
  if (paymentTier) return paymentTier

  const tier = mapTierTokenToProductTier(metadata.tier)
  if (tier) return tier

  return null
}

export function buildRewardTierJobMetadata(metadata?: RewardTierMetadata | null): Record<string, unknown> {
  const productTier = resolveRewardProductTier(metadata)
  if (!productTier) return {}

  return {
    product_key: productTier,
    legacyTier: normalizeMetadataString(metadata?.legacyTier) ?? normalizeMetadataString(metadata?.legacy_tier) ?? productTier,
    tier: normalizeMetadataString(metadata?.tier) ?? productTier,
    paymentTier: normalizeMetadataString(metadata?.paymentTier) ?? normalizeMetadataString(metadata?.payment_tier) ?? productTier,
    access_type: normalizeMetadataString(metadata?.access_type) ?? null,
    reward_track: normalizeMetadataString(metadata?.reward_track) ?? null,
  }
}

export function getRewardAmountRawForMilestone(
  milestoneNumber: number,
  metadata?: RewardTierMetadata | null,
  context?: RewardResolutionContext,
): string {
  if (!Number.isInteger(milestoneNumber) || milestoneNumber < 1) {
    throw new Error('Invalid milestoneNumber: expected a positive integer')
  }

  const productTier = resolveRewardProductTier(metadata)
  const resolutionContext = context ?? {
    rewardTrack: 'full_academy' as const,
    accessType: 'all_modules' as const,
    milestoneNumber,
  }

  if (
    (productTier === 'FOUNDATION' || productTier === 'BUILDER_ACCELERATOR' || productTier === 'FOUNDER_ELITE')
    && hasRewardShape(metadata, resolutionContext)
  ) {
    const configuredAmounts = metadata?.reward_amounts_raw
    if (configuredAmounts && typeof configuredAmounts === 'object' && !Array.isArray(configuredAmounts)) {
      const amount = (configuredAmounts as Record<string, unknown>)[String(milestoneNumber)]
      if (typeof amount === 'string') {
        return assertRawAmount(`reward_amounts_raw.${milestoneNumber}`, amount)
      }
    }
  }

  throw buildResolutionError('full_academy', metadata, resolutionContext)
}

export function getSingleModuleRewardAmountRaw(
  metadata?: RewardTierMetadata | null,
  context?: RewardResolutionContext,
): string {
  const productTier = resolveRewardProductTier(metadata)
  const resolutionContext = context ?? {
    rewardTrack: 'single_module' as const,
    accessType: 'single_module' as const,
  }

  if (productTier === 'ENTRY' && hasRewardShape(metadata, resolutionContext)) {
    const amount = metadata?.single_module_reward_amount_raw
    if (typeof amount === 'string') {
      return assertRawAmount('single_module_reward_amount_raw', amount)
    }
  }

  if (productTier === 'INTERNAL_TEST' && hasRewardShape(metadata, resolutionContext)) {
    return assertRawAmount('IVT_REWARD_SINGLE_MODULE_AMOUNT_RAW', readEnv('IVT_REWARD_SINGLE_MODULE_AMOUNT_RAW'))
  }

  if (!context && !metadata) {
    return assertRawAmount('IVT_REWARD_SINGLE_MODULE_AMOUNT_RAW', readEnv('IVT_REWARD_SINGLE_MODULE_AMOUNT_RAW'))
  }

  throw buildResolutionError('single_module', metadata, resolutionContext)
}

export function getRewardConfig(): RewardConfig {
  const tokenMintAddress = readEnv('IVT_TOKEN_MINT_ADDRESS').trim()
  const rewardWalletPublicKey = readEnv('IVT_REWARD_WALLET_PUBLIC_KEY').trim()
  const solanaRpcUrl = readEnv('IVT_SOLANA_RPC_URL').trim()

  if (!tokenMintAddress) throw new Error('Missing required env var: IVT_TOKEN_MINT_ADDRESS')
  if (!rewardWalletPublicKey) throw new Error('Missing required env var: IVT_REWARD_WALLET_PUBLIC_KEY')
  if (!solanaRpcUrl) throw new Error('Missing required env var: IVT_SOLANA_RPC_URL')

  const maxPayoutsPerRun = parsePositiveInteger(
    'IVT_MAX_PAYOUTS_PER_RUN',
    readOptionalEnv('IVT_MAX_PAYOUTS_PER_RUN', '10'),
  )

  return {
    network: readOptionalEnv('IVT_REWARD_NETWORK', 'mainnet-beta').trim(),
    payoutWorkerEnabled: parseBoolean(readOptionalEnv('IVT_PAYOUT_WORKER_ENABLED', 'false')),
    payoutDryRun: parseBoolean(readOptionalEnv('IVT_PAYOUT_DRY_RUN', 'true')),
    payoutSafeTestOnly: parseBoolean(readOptionalEnv('IVT_PAYOUT_SAFE_TEST_ONLY', 'false')),
    payoutSafeTestModuleNumber: parseOptionalNonNegativeInteger('IVT_PAYOUT_SAFE_TEST_MODULE_NUMBER'),
    maxPayoutsPerRun,
    tokenMintAddress,
    rewardWalletPublicKey,
    solanaRpcUrl,
  }
}

export function getPayoutTransferConfig(): RewardTransferConfig {
  const baseConfig = getRewardConfig()
  const rewardWalletSecretKey = readEnv('IVT_REWARD_WALLET_SECRET_KEY').trim()

  if (!rewardWalletSecretKey) {
    throw new Error('Missing required env var: IVT_REWARD_WALLET_SECRET_KEY')
  }

  return {
    ...baseConfig,
    rewardWalletSecretKey,
  }
}

export function getRedactedRewardConfig() {
  const config = getRewardConfig()
  return {
    network: config.network,
    payoutWorkerEnabled: config.payoutWorkerEnabled,
    payoutDryRun: config.payoutDryRun,
    payoutSafeTestOnly: config.payoutSafeTestOnly,
    payoutSafeTestModuleNumber: config.payoutSafeTestModuleNumber,
    maxPayoutsPerRun: config.maxPayoutsPerRun,
    tokenMintAddress: config.tokenMintAddress,
    rewardWalletPublicKey: config.rewardWalletPublicKey,
    solanaRpcUrl: config.solanaRpcUrl,
    hasTransferSecretKey: Boolean(process.env.IVT_REWARD_WALLET_SECRET_KEY),
  }
}
