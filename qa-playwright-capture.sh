#!/usr/bin/env bash
# TrimStack QA capture — runs the Playwright E2E + screenshot-capture suite
# against an ALREADY-RUNNING app.
#
# This script NEVER starts servers and NEVER spawns background processes —
# the orchestrator owns dev-server lifecycle. If the app is not up, this
# fails fast with a clear message.
#
# Usage: ./qa-playwright-capture.sh [playwright args...]
# Env:   BASE_URL  (default http://localhost:5173)
# Output: qa-screenshots/  (PNG captures: viewports, dark mode, before/afters)
#        test-results.json (machine-readable pass/fail per spec)

set -euo pipefail
cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-http://localhost:5173}"
export BASE_URL

# Fail fast if the app is not running (we never start it ourselves)
if ! curl -sf --max-time 5 "${BASE_URL}" >/dev/null 2>&1; then
  echo "ERROR: App is not reachable at ${BASE_URL}." >&2
  echo "Start the dev servers first (orchestrator-owned), then re-run." >&2
  exit 2
fi

# Fail fast if Playwright is not installed
if ! node -e "require.resolve('@playwright/test')" >/dev/null 2>&1; then
  echo "ERROR: @playwright/test is not installed at the repo root." >&2
  echo "Fix: npm install -D @playwright/test && npx playwright install chromium" >&2
  exit 2
fi

echo "Capturing QA evidence against ${BASE_URL} ..."
npx playwright test "$@"

echo "Done. Evidence:"
echo "  - qa-screenshots/   (device, dark-mode, and before/after captures)"
echo "  - test-results.json (machine-readable results)"
