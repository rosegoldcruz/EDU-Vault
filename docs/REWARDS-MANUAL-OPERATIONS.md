# Rewards Manual Operations

Education completion, eligibility, review, approval, and fulfillment are separate.

Canonical statuses: `INELIGIBLE`, `PENDING_EDUCATION`, `PENDING_WALLET`, `READY_FOR_REVIEW`, `APPROVED`, `REJECTED`, `FULFILLED`, `CANCELLED`.

Record eligibility reason, milestone, evidence, reviewer, decision reason, approval time, verified destination wallet, external fulfillment reference, and immutable audit history. Only authorized humans may approve/reject and record fulfillment. No course, webhook, worker, scheduler, cron, or admin retry action may sign or send an asset.

Legacy reward calculations and admin UI may be adapted. Legacy Solana signer, automatic queue execution, immediate `processPayoutJobNow`, payout secrets, and five-minute Vercel payout cron are prohibited.

