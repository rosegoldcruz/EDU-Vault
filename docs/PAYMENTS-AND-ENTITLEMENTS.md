# Payments and Entitlements

Payment buys education access; it does not buy guaranteed token value, returns, or automated payout.

Implement a provider-neutral adapter with:

- internal payment intent/transaction identity;
- unique provider event identity and signed raw event storage;
- exactly-once processing and entitlement-grant ledger in one database transaction;
- Module 0 free access after the required capture/account flow;
- paid access to Modules 1-22;
- refunds, disputes, revocations, expiry, and manual override with reason/audit;
- durable retry/dead-letter and GHL synchronization.

Legacy Stripe checkout metadata and signature validation are useful baselines. Legacy manual/USDC routes, client-supplied user identity, and same-amount treasury attribution are rejected. Stripe is an adapter candidate, not a locked merchant.

