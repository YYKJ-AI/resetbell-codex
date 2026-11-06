# QuotaOps Codex plugin

This local Agent Plugin packages the `reset-radar` skill and a zero-dependency Node 22 CLI for QuotaOps public read-only API.

## Install from the public marketplace

```bash
codex plugin marketplace add YYKJ-AI/resetbell-codex
codex plugin add reset-radar-codex@resetbell
```

Then ask Codex about public quota resets, grants, forecasts, or monitoring. The `reset-radar` skill uses the public API without an account or key.

## Local marketplace test

From the repository root:

```bash
codex plugin marketplace add .
codex plugin add reset-radar-codex@resetbell
codex plugin marketplace list
```

The catalog is `.agents/plugins/marketplace.json`. The one-prompt API integration works without installing the plugin.

## CLI smoke test

```bash
node plugins/reset-radar-codex/skills/reset-radar/scripts/quotaops.mjs snapshot
QUOTAOPS_BASE_URL=http://127.0.0.1:3100 \
  node plugins/reset-radar-codex/skills/reset-radar/scripts/quotaops.mjs updates --provider codex --limit 5
```

Public scope is Codex, Claude, Kimi, and DeepSeek. The API needs no key and performs no write or personal-account operation.

Version 1.0.1 distinguishes recorded history from complete coverage, uses shared verified completion times, and separates document verification dates and X/document health. Current-policy documents are not reset events.
