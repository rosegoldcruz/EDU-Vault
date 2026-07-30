# GoHighLevel Integration

Location: `OOxBz4Jalnuam4eNqhvD`.

Use the dedicated `iron_vault_ghl` MCP first when available, then verified official REST endpoints for missing capabilities, and authenticated UI automation only for confirmed UI-only resources. Do not send messages, place calls, bulk tag, bulk enroll, or activate production outreach during implementation.

Required implementation:

- exact raw-body webhook authentication and provider event ledger;
- internal-user ↔ GHL-contact and opportunity mappings;
- idempotent contact, tag, custom-field, opportunity, appointment, and DND synchronization;
- canonical outcome precedence with DNC first;
- Voice AI summary, primary question, primary objection, transfer/schedule/callback/nurture/voicemail/no-answer outcomes;
- durable retries, dead letters, reconciliation, audit, and management reports;
- controlled-test-contact staging before any production cohort.

The automation source supplies outcome/DNC/ledger primitives, not an enabled GHL client. Its current official signature path must be rewritten to verify exact request bytes.

