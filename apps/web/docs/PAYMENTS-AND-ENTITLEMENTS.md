# Payments and Entitlements

Payment buys education access; it does not buy guaranteed token value, returns, or automated payout.

Implement a provider-neutral adapter with:

- internal payment intent/transaction identity;
- unique provider event identity and signed raw event storage;
- exactly-once processing and entitlement-grant ledger in one database transaction;
- Module 0 authenticated-free access after the still-pending capture/account decision;
- paid full-Academy access to the verified Modules 1-12;
- paid single-module access only where an approved product rule grants a specific module (legacy evidence covers Modules 1-6);
- refunds, disputes, revocations, expiry, and manual override with reason/audit;
- durable retry/dead-letter and GHL synchronization.

Legacy Stripe checkout metadata and signature validation are useful baselines. Legacy manual/USDC routes, client-supplied user identity, and same-amount treasury attribution are rejected. Stripe is an adapter candidate, not a locked merchant.

No source or Git-history evidence supports a Module 13-22 curriculum. Expansion beyond Module 12 requires an explicit product/content decision and authored records; it must not be inferred from the prior `1-22` sentence.

Privy sign-in creates identity only. Payment, invite, grandfathered, or audited administrator evidence creates entitlement. Refund/dispute/revocation history is retained rather than deleting grants.
