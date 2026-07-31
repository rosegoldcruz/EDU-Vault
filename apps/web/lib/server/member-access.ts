import { cookies, headers } from 'next/headers'
import { getDatabasePool } from '@iron-vault/database'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import {
	getPrivyAccessTokenFromHeaders,
	requirePrivyUserFromAccessToken,
	type AuthenticatedPrivyUser,
} from '@/lib/server/privy-auth'
import { getActiveCurriculumRelease } from '@/lib/server/active-curriculum'

type EntitlementStatus = 'active' | 'revoked' | 'expired'
type EntitlementSource = 'stripe' | 'authorize_net' | 'invite' | 'grandfathered' | 'admin'

type MemberEntitlement = {
	id: string
	privy_user_id: string | null
	email: string | null
	wallet_address: string | null
	source: EntitlementSource
	status: EntitlementStatus
	stripe_customer_id: string | null
	stripe_checkout_session_id: string | null
	stripe_payment_intent_id: string | null
	payment_provider?: string | null
	provider_checkout_session_id?: string | null
	provider_payment_id?: string | null
	invite_code: string | null
	granted_by: string | null
	granted_at: string
	expires_at: string | null
	metadata: Record<string, unknown>
	created_at: string
	updated_at: string
}

export type MemberAccessContext = {
	auth: AuthenticatedPrivyUser
	isAdmin: boolean
	entitlement: MemberEntitlement | null
}

export type MemberAccessScope = {
	hasAccess: boolean
	accessType: 'free' | 'all_modules' | 'single_module' | 'admin'
	allowedModules: number[]
	allowedModuleIds: string[]
	releaseId: string
	releaseVersion: string
	entitlementId?: string
}

const ACCESS_TOKEN_COOKIE_NAMES = ['privy-token', 'privy-id-token'] as const

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unknown error'
}

function isUnauthorizedError(error: unknown): boolean {
	return getErrorMessage(error).startsWith('Unauthorized:')
}

async function getAccessToken(request?: Request): Promise<string | null> {
	if (request) {
		return getPrivyAccessTokenFromHeaders(request.headers)
	}

	const headerStore = await headers()
	const tokenFromHeaders = getPrivyAccessTokenFromHeaders(headerStore)
	if (tokenFromHeaders) return tokenFromHeaders

	const cookieStore = await cookies()
	for (const cookieName of ACCESS_TOKEN_COOKIE_NAMES) {
		const cookieValue = cookieStore.get(cookieName)?.value
		if (cookieValue && cookieValue.length > 0) {
			return decodeURIComponent(cookieValue)
		}
	}

	return null
}

async function getAuthenticatedUser(request?: Request): Promise<AuthenticatedPrivyUser> {
	const token = await getAccessToken(request)
	if (!token) throw new Error('Unauthorized: missing authentication token')

	try {
		return await requirePrivyUserFromAccessToken(token)
	} catch (error: unknown) {
		if (isUnauthorizedError(error)) {
			throw error
		}
		throw new Error('Unauthorized: invalid authentication token')
	}
}

export async function getOptionalAuthenticatedUser(request?: Request): Promise<AuthenticatedPrivyUser | null> {
	try {
		return await getAuthenticatedUser(request)
	} catch (error: unknown) {
		if (isUnauthorizedError(error)) return null
		throw error
	}
}

async function isAdminUser(privyUserId: string): Promise<boolean> {
	const result = await getDatabasePool().query<{ is_admin: boolean }>(
		`
			SELECT EXISTS (
				SELECT 1
				FROM identity_accounts
				INNER JOIN members
					ON members.id = identity_accounts.member_id
				INNER JOIN member_role_assignments
					ON member_role_assignments.member_id = members.id
					AND member_role_assignments.revoked_at IS NULL
				INNER JOIN roles
					ON roles.id = member_role_assignments.role_id
				WHERE identity_accounts.provider = 'privy'
					AND identity_accounts.provider_subject = $1
					AND members.status = 'active'
					AND roles.code = 'admin'
			) AS is_admin
		`,
		[privyUserId],
	)

	return result.rows[0]?.is_admin ?? false
}

async function findActiveEntitlement(
	column: 'privy_user_id' | 'email' | 'wallet_address',
	value: string,
): Promise<MemberEntitlement | null> {
	const nowIso = new Date().toISOString()

	const { data, error } = await getSupabaseAdmin()
		.from('iv_member_entitlements')
		.select('*')
		.eq(column, value)
		.eq('status', 'active')
		.or(`expires_at.is.null,expires_at.gt.${nowIso}`)
		.order('granted_at', { ascending: false })
		.limit(1)

	if (error) throw error
	if (!data || data.length === 0) return null

	return data[0] as MemberEntitlement
}

export async function requireMemberAccess(request?: Request): Promise<MemberAccessContext> {
	const auth = await getAuthenticatedUser(request)
	const isAdmin = await isAdminUser(auth.privyUserId)
	if (isAdmin) {
		return { auth, isAdmin: true, entitlement: null }
	}

	const checks: Array<Promise<MemberEntitlement | null>> = [findActiveEntitlement('privy_user_id', auth.privyUserId)]

	if (auth.email) {
		checks.push(findActiveEntitlement('email', auth.email))
	}

	if (auth.walletAddress) {
		checks.push(findActiveEntitlement('wallet_address', auth.walletAddress))
	}

	for (const check of checks) {
		const entitlement = await check
		if (entitlement) {
			return { auth, isAdmin: false, entitlement }
		}
	}

	throw new Error('Forbidden: member entitlement required')
}

async function scopeFromEntitlement(entitlement: MemberEntitlement): Promise<MemberAccessScope> {
	const release = await getActiveCurriculumRelease()
	const metadata = entitlement.metadata ?? {}
	const accessType = metadata.access_type
	const moduleNumber = Number(metadata.module_number)
	const moduleId = typeof metadata.module_id === 'string' ? metadata.module_id : null
	const selectedModule = moduleId
		? release.modules.find((module) => module.id === moduleId)
		: release.modules.find((module) => module.legacyNumber === moduleNumber)

	if (accessType === 'single_module' && selectedModule) {
		const grantedModules = release.modules.filter(
			(module) => module.id === selectedModule.id || module.accessClass === 'free',
		)
		return {
			hasAccess: true,
			accessType: 'single_module',
			allowedModules: grantedModules
				.map((module) => module.legacyNumber)
				.filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber)),
			allowedModuleIds: grantedModules.map((module) => module.id),
			releaseId: release.id,
			releaseVersion: release.version,
			entitlementId: entitlement.id,
		}
	}

	return {
		hasAccess: true,
		accessType: 'all_modules',
		allowedModules: release.modules
			.map((module) => module.legacyNumber)
			.filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber)),
		allowedModuleIds: release.modules.map((module) => module.id),
		releaseId: release.id,
		releaseVersion: release.version,
		entitlementId: entitlement.id,
	}
}

export async function getMemberAccessScope(request?: Request): Promise<MemberAccessScope> {
	const release = await getActiveCurriculumRelease()
	const freeModules = release.modules.filter((module) => module.accessClass === 'free')
	const freeScope: MemberAccessScope = {
		hasAccess: true,
		accessType: 'free',
		allowedModules: freeModules
			.map((module) => module.legacyNumber)
			.filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber)),
		allowedModuleIds: freeModules.map((module) => module.id),
		releaseId: release.id,
		releaseVersion: release.version,
	}
	let access: MemberAccessContext
	try {
		access = await requireMemberAccess(request)
	} catch (error: unknown) {
		if (getErrorMessage(error).startsWith('Forbidden:')) {
			return freeScope
		}
		throw error
	}
	if (access.isAdmin) {
		return {
			hasAccess: true,
			accessType: 'admin',
			allowedModules: release.modules
				.map((module) => module.legacyNumber)
				.filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber)),
			allowedModuleIds: release.modules.map((module) => module.id),
			releaseId: release.id,
			releaseVersion: release.version,
		}
	}

	if (!access.entitlement) {
		throw new Error('Forbidden: member entitlement required')
	}

	return await scopeFromEntitlement(access.entitlement)
}

export function canAccessModule(scope: MemberAccessScope, moduleNumber: number): boolean {
	return scope.hasAccess && scope.allowedModules.includes(moduleNumber)
}

export function canAccessAcademyHub(): boolean {
	return true
}

export function canAccessAcademyModule(scope: MemberAccessScope | null, moduleNumber: number): boolean {
	if (!scope) return false
	return canAccessModule(scope, moduleNumber)
}

export function canAccessDashboard(scope: MemberAccessScope | null): boolean {
	return Boolean(scope?.hasAccess)
}

export function canAccessMemberFeature(scope: MemberAccessScope | null): boolean {
	return canAccessDashboard(scope)
}

export async function getAcademyAccessScope(request?: Request): Promise<{ auth: AuthenticatedPrivyUser | null; scope: MemberAccessScope }> {
	const auth = await getOptionalAuthenticatedUser(request)
	if (!auth) {
		const release = await getActiveCurriculumRelease()
		const freeModules = release.modules.filter((module) => module.accessClass === 'free')
		return {
			auth: null,
			scope: {
				hasAccess: true,
				accessType: 'free',
				allowedModules: freeModules
					.map((module) => module.legacyNumber)
					.filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber)),
				allowedModuleIds: freeModules.map((module) => module.id),
				releaseId: release.id,
				releaseVersion: release.version,
			},
		}
	}

	try {
		const scope = await getMemberAccessScope(request)
		return { auth, scope }
	} catch (error: unknown) {
		const message = getErrorMessage(error)
		if (message.startsWith('Forbidden:')) {
			const release = await getActiveCurriculumRelease()
			const freeModules = release.modules.filter((module) => module.accessClass === 'free')
			return {
				auth,
				scope: {
					hasAccess: true,
					accessType: 'free',
					allowedModules: freeModules
						.map((module) => module.legacyNumber)
						.filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber)),
					allowedModuleIds: freeModules.map((module) => module.id),
					releaseId: release.id,
					releaseVersion: release.version,
				},
			}
		}
		throw error
	}
}

export async function requireModuleAccess(request: Request | undefined, moduleNumber: number): Promise<MemberAccessScope> {
	if (!Number.isInteger(moduleNumber)) {
		throw new Error('Forbidden: invalid module access request')
	}

	const scope = await getMemberAccessScope(request)
	if (!canAccessModule(scope, moduleNumber)) {
		throw new Error('Forbidden: module access not purchased')
	}

	return scope
}

export async function requireAdminAccess(request?: Request): Promise<MemberAccessContext> {
	const auth = await getAuthenticatedUser(request)
	const isAdmin = await isAdminUser(auth.privyUserId)

	if (!isAdmin) {
		throw new Error('Forbidden: admin access required')
	}

	return { auth, isAdmin: true, entitlement: null }
}
