---
name: reset-radar
description: Answer questions about public AI quota resets, forecasts, monitoring, and rules by querying the QuotaOps read-only API.
---

# QuotaOps Reset Radar

Use this skill when the user asks about AI quota resets, grants, forecasts, monitoring, or current rules for Codex, Claude, Kimi, or DeepSeek.

## Commands

Run commands from this skill directory with Node 22 or newer. No API key or login is needed.

```bash
node scripts/quotaops.mjs snapshot
node scripts/quotaops.mjs updates --provider codex --limit 20
node scripts/quotaops.mjs monitoring
node scripts/quotaops.mjs forecasts --days 30
```

Set `QUOTAOPS_BASE_URL` only when testing a local deployment. The default is `https://resetbell.dev`.

## Answer rules

- Treat API output as the current public record; do not invent reset times or probabilities.
- Public provider slugs are `codex`, `claude`, `kimi`, and `deepseek`.
- Distinguish an announcement or forecast from a confirmed reset, and prominently surface withdrawn or revised information.
- Quote UTC times as UTC, include relevant evidence URLs when available, and say when the API has insufficient public evidence.
- This API is read-only and never reads a user's personal provider account.

- Describe dates as the latest **recorded and verified** announcement, never proof of exhaustive history. Zero records means none verified in the collected data, not that the provider has never reset usage.
- For the latest reset/card grant, use the API `completion.type` and `completion.at`; consider both `global_reset` and `banked_grant`, label the type, and keep direct-reset counts separate. Do not use `latestAt` as an execution date or count plans, withdrawn records, documents, discounts or normal subscription refreshes as completed resets.
- `documentReviewedAt` is a document verification time, not the vendor publication, policy start or grant date. Surface current eligibility, amounts, deadlines and official document links from `facts` and `timeline`; missing dates remain unknown.
- Report X and official-document source health separately from local/API connectivity. A successful empty poll is not proof of complete X coverage. Historical, document baseline and `notificationSuppressed` records must not trigger backfill reminders.
