export type DataMode = "mock" | "api";
export type Role = "MEMBER" | "VIP" | "ADMIN";
export type Tone = "success" | "pending" | "neutral" | "danger";

export interface MemberIdentity {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  initials: string;
}

export interface Membership {
  tier: string;
  status: "ACTIVE" | "PAST_DUE" | "INACTIVE";
  source: "MOCK_ENTITLEMENT" | "API_ENTITLEMENT";
  since: string;
}

export interface WalletState {
  address: string | null;
  network: "Solana";
  verified: boolean;
  rewardReady: boolean;
  displayBalance: string;
}

export interface DashboardSummary {
  xp: number;
  academyPercent: number;
  referralCount: number;
  openTickets: number;
  positionValue: number;
  activity: Array<{ id: string; label: string; detail: string; at: string }>;
}

export interface Position {
  id: string;
  name: string;
  category: string;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  principal: number;
  currentValue: number;
  participation: string;
}

export interface Referral {
  id: string;
  name: string;
  relationship: string;
  status: "CONTACTED" | "NEW" | "CONVERTED";
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: "PENDING" | "RESPONDED" | "CLOSED";
  updatedAt: string;
  message: string;
}

export interface RewardRecord {
  id: string;
  label: string;
  status: "LOCKED" | "ELIGIBLE" | "UNDER_REVIEW" | "APPROVED" | "PAID";
  amount: string;
  date: string | null;
  note: string;
}

export interface AcademySummary {
  pathTitle: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
  modules: Array<{ id: string; title: string; progress: number; state: "ACTIVE" | "LOCKED" | "COMPLETE" }>;
}

export interface ServiceStatus {
  overall: "OPERATIONAL" | "DEGRADED";
  services: Array<{ name: string; status: "OPERATIONAL" | "DEGRADED"; detail: string }>;
  notices: Array<{ title: string; detail: string; date: string }>;
}

export interface VipSummary {
  eligible: boolean;
  status: "ACTIVE" | "REVIEW" | "LOCKED";
  benefits: Array<{ title: string; detail: string }>;
}

export interface MemberData {
  identity: MemberIdentity;
  membership: Membership;
  wallet: WalletState;
  dashboard: DashboardSummary;
  positions: Position[];
  referrals: Referral[];
  tickets: Ticket[];
  rewards: RewardRecord[];
  academy: AcademySummary;
  status: ServiceStatus;
  vip: VipSummary;
}

export type ResourceKey = keyof Omit<MemberData, "identity">;

export interface AdapterResult<T> {
  data: T;
  mode: DataMode;
  receivedAt: string;
}

export interface MutationResult<T> {
  data: T;
  mode: DataMode;
  persisted: boolean;
  message: string;
}
