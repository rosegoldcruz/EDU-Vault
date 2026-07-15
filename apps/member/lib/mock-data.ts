import type { MemberData } from "./contracts";

export const mockMemberData: MemberData = {
  identity: { id: "mem_01IV", displayName: "Alex Morgan", email: "alex@ironvault.example", role: "ADMIN", initials: "AM" },
  membership: { tier: "Founding Member", status: "ACTIVE", source: "MOCK_ENTITLEMENT", since: "May 2026" },
  wallet: { address: "7Yk8...4qVp", network: "Solana", verified: true, rewardReady: true, displayBalance: "12,450 IVT" },
  dashboard: {
    xp: 2380, academyPercent: 42, referralCount: 7, openTickets: 1, positionValue: 28750,
    activity: [
      { id: "a1", label: "Lesson completed", detail: "Wallet Security Fundamentals · +80 XP", at: "Today, 9:42 AM" },
      { id: "a2", label: "Referral updated", detail: "Jordan Lee moved to Contacted", at: "Yesterday" },
      { id: "a3", label: "Reward review", detail: "Milestone 1 entered manual review", at: "Jul 12" },
    ],
  },
  positions: [
    { id: "pos_1", name: "Founding Allocation", category: "Ownership", status: "ACTIVE", principal: 15000, currentValue: 18400, participation: "Core" },
    { id: "pos_2", name: "Royalty Series A", category: "Royalty", status: "ACTIVE", principal: 8500, currentValue: 10350, participation: "2%" },
    { id: "pos_3", name: "Growth Participation", category: "Portfolio", status: "PENDING", principal: 0, currentValue: 0, participation: "Review" },
  ],
  referrals: [
    { id: "ref_1", name: "Jordan Lee", relationship: "Business", status: "CONTACTED", createdAt: "Jul 11, 2026" },
    { id: "ref_2", name: "Maya Chen", relationship: "Colleague", status: "NEW", createdAt: "Jul 9, 2026" },
    { id: "ref_3", name: "Sam Rivera", relationship: "Friend", status: "CONVERTED", createdAt: "Jun 28, 2026" },
  ],
  tickets: [
    { id: "IV-1042", subject: "Wallet verification question", status: "RESPONDED", updatedAt: "Today", message: "The team replied with verification guidance." },
    { id: "IV-1029", subject: "Membership profile update", status: "CLOSED", updatedAt: "Jul 3", message: "Profile details were reviewed and updated." },
  ],
  rewards: [
    { id: "rw_1", label: "Academy Milestone 1", status: "UNDER_REVIEW", amount: "2,500 IVT", date: "Jul 12, 2026", note: "Awaiting manual operations review." },
    { id: "rw_2", label: "Academy Milestone 2", status: "LOCKED", amount: "2,500 IVT", date: null, note: "Complete the required learning milestone." },
    { id: "rw_3", label: "Founding Member Recognition", status: "APPROVED", amount: "1,000 IVT", date: "Jun 30, 2026", note: "Approved; fulfillment is handled manually." },
  ],
  academy: {
    pathTitle: "Crypto Foundations", progressPercent: 42, completedLessons: 5, totalLessons: 12, nextLesson: "Protecting keys and recovery phrases",
    modules: [
      { id: "m0", title: "Orientation", progress: 100, state: "COMPLETE" },
      { id: "m1", title: "Blockchain Foundations", progress: 72, state: "ACTIVE" },
      { id: "m2", title: "Wallet Ownership", progress: 0, state: "LOCKED" },
      { id: "m3", title: "DeFi Operations", progress: 0, state: "LOCKED" },
    ],
  },
  status: {
    overall: "OPERATIONAL",
    services: [
      { name: "Member Back Office", status: "OPERATIONAL", detail: "Interface available" },
      { name: "Vault Data", status: "OPERATIONAL", detail: "Mock adapter connected" },
      { name: "Academy", status: "OPERATIONAL", detail: "Learning interface available" },
      { name: "Reward Operations", status: "DEGRADED", detail: "Manual review only" },
    ],
    notices: [{ title: "Member interface restoration", detail: "The unified back office is being connected to canonical services in stages.", date: "Jul 14, 2026" }],
  },
  vip: {
    eligible: true, status: "ACTIVE",
    benefits: [
      { title: "Priority support", detail: "VIP requests receive priority review by the member operations team." },
      { title: "Partner briefings", detail: "Access private operating updates and scheduled briefings." },
      { title: "Early access", detail: "Preview eligible new Academy and Vault capabilities." },
    ],
  },
};
