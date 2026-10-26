#!/usr/bin/env bash
# Local definition-of-done check (the same commands as CI). On success it
# records the verified tree in .git/skillup-verified (read by the Stop hook)
# and prints an Evidence block for the PR body.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
tree_id() { { git rev-parse HEAD; git diff HEAD; git ls-files --others --exclude-standard; } | shasum | cut -c1-40; }
log="$(mktemp)"
step() { echo "== $1"; echo "\$ $2" >>"$log"; if bash -c "$2" >>"$log.full" 2>&1; then echo "  ok" | tee -a "$log"; else echo "  FAILED" | tee -a "$log"; tail -40 "$log.full"; exit 1; fi; }
[[ -d node_modules ]] || step "Install" "npm ci --no-audit --no-fund"
step "TypeScript" "npx tsc --noEmit"
step "Vitest" "npx vitest run"
step "ESLint (no new errors; 14 known, see platform#63)" "npx eslint . -f json -o /tmp/skillup-eslint.json || true; python3 -c 'import json;n=sum(f[\"errorCount\"] for f in json.load(open(\"/tmp/skillup-eslint.json\")));print(\"errors=%d\"%n);exit(0 if n<=14 else 1)'"
tree_id >"$(git rev-parse --git-dir)/skillup-verified"
echo
echo "---- paste into the PR Evidence section ----"
echo "Commit: $(git rev-parse --short HEAD)$( [[ -n "$(git status --porcelain)" ]] && echo " (plus uncommitted changes: commit, push, re-run)")"
echo "\`\`\`"
cat "$log"
echo "\`\`\`"
rm -f "$log" "$log.full"
