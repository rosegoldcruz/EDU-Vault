# Assessment Security Audit

## Severity result

**Critical: legacy assessment completion is client-authoritative and can lead to automatic asset transfer.**

An authenticated user with module entitlement can submit arbitrary `score` and `passed` values to the education endpoint. The API does not receive selections, load an answer key, verify lesson completion, constrain score to 0-10, or derive pass/fail. For Modules 1-6, the persisted result can become the latest passed attempt, create module completion and reward eligibility, queue a payout, and call immediate payout processing.

## Legacy flow

```text
answer key and correct indexes ship in browser JavaScript
  -> browser shuffles options while retaining a correct index
  -> browser calculates score and passed >= 8
  -> POST /api/education-progress { moduleIndex, score, passed }
  -> API stores caller score/passed in quiz_results
  -> latest quiz row determines module completion
  -> iv_module_completions / XP / milestone eligibility
  -> payout job queue and optional processPayoutJobNow
```

## Findings

| Severity | Finding | Evidence | Impact | Canonical requirement |
|---|---|---|---|---|
| Critical | API trusts caller `score` and `passed` | `app/api/education-progress/route.ts:174`; `lib/education-actions.ts:152` | Forged completion and reward eligibility | Accept selected option IDs only; score server-side |
| Critical | Completion can invoke immediate payout | `reward-milestones.ts` imports `processPayoutJobNow` | Education action can send assets | Remove all transfer/signing paths |
| High | Correct answers reach browser | `iron-vault-academy-unlocked.jsx` contains `correct` for all 130 questions | Answer extraction/tampering | Private answer-key repository; public assessment payload omits correctness |
| High | Orientation GHL qualification trusts caller body | unauthenticated orientation-qualified route | Anyone can create qualification webhook traffic | Verified assessment event only, persisted before worker sync |
| High | Lesson completion is caller-declared | education endpoint accepts any integer lesson index | Prerequisites can be forged or invalid indexes stored | Resolve published lesson by ID/slug and enforce transition server-side |
| Medium | Latest attempt semantics allow a failed retake to undo completion | latest row by `attempted_at` is sole truth | Completion/reward state instability | Define immutable earned completion; retries create attempts without retracting earned state unless policy says otherwise |
| Medium | No attempt idempotency | every submission inserts a row | Duplicate attempts/races | Client-generated idempotency key plus unique constraint |
| Medium | No question/assessment version snapshot | only module index, score, pass stored | Cannot audit which questions were scored | Attempt references assessment revision and snapshots selected options/result |
| Medium | Module sequence enforced only in UI | `modStatus()` controls navigation | Direct API can bypass prior-module sequence | API validates entitlement and prerequisites |
| Medium | No tests | repository has no project tests | Security regressions undetected | Contract, repository, transaction, abuse, and authorization tests |

## Canonical assessment contract

### Read assessment

`GET /v1/academy/assessments/{slug}` returns assessment ID/revision, prompt and option IDs/text, attempt policy, threshold, and current member state. It never returns correct option IDs, correctness flags, raw answer keys, or score formulas that reveal answers.

### Start attempt

`POST /v1/academy/assessments/{slug}/attempts`:

- Verifies Privy identity and canonical user.
- Verifies entitlement, publication, module/lesson prerequisites, and retry policy.
- Creates `IN_PROGRESS` attempt with assessment revision and expiry.
- Returns attempt ID and public question/options in deterministic or server-randomized order.

### Submit attempt

`POST /v1/academy/assessment-attempts/{id}/submit` body:

```json
{
  "idempotencyKey": "client-generated-uuid",
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "uuid" }
  ]
}
```

The transaction must:

1. Lock the attempt and reject non-owner, expired, already-finalized, wrong-revision, duplicate-question, missing-required-answer, or unknown-option submissions.
2. Load authoritative questions/options from a private repository query.
3. Calculate raw score and pass/fail on the server.
4. Persist selected answers and correctness snapshots.
5. Finalize the attempt exactly once.
6. Create immutable module completion only when policy is satisfied.
7. Create content unlock and XP events using unique source keys.
8. Evaluate reward eligibility as a separate ledger event; do not approve or fulfill it.
9. Commit all state atomically and emit an outbox event after commit.

## Completion and retry policy

- Passing threshold remains 8/10 until product approval changes it.
- A passed module creates an earned completion that a later failed retake does not erase.
- Attempts remain immutable after scoring.
- XP is awarded once per configured source, not once per retry.
- Reward eligibility references the authoritative attempt/completion evidence.
- Modules 1-6 may be reward-relevant; Modules 0 and 7-12 are education-only under verified legacy behavior.

## Test requirements

- Correct, incorrect, incomplete, duplicate, and out-of-scope option submissions.
- Forged score/pass fields rejected by schema because they are not accepted.
- Cross-user attempt access denied.
- Single-module and full-Academy scope checks.
- Prerequisite bypass attempts.
- Concurrent duplicate submission returns one final result and one XP/completion event.
- Failed retry does not erase earned completion.
- Answer keys absent from serialized member responses and frontend bundles.
- Reward eligibility may be created, but no code path signs/sends tokens or money.

## Port decision

Retain the 130 question/option/answer sets as migration content and the 8/10 product rule as evidence. Reject the legacy scoring, submission, completion, GHL qualification, XP coupling, and payout-trigger implementation.
