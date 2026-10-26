#!/usr/bin/env bash
# Claude Code Stop hook: an agent can't finish with unverified code changes.
# Blocks when the working tree or branch has non-doc changes and the current
# tree was not verified by scripts/verify.sh. Never blocks on main with a clean
# tree, on docs-only changes, or on a second consecutive stop (stop_hook_active).
set -euo pipefail
input="$(cat)"
[[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]] && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

changed="$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; git diff --name-only origin/main...HEAD 2>/dev/null; } | sort -u)"
code="$(grep -vE '(\.md$|^docs/|^\.gitignore$|^LICENSE$|^\.claude/)' <<<"$changed" || true)"
[[ -z "$code" ]] && exit 0

tree="$({ git rev-parse HEAD; git diff HEAD; git ls-files --others --exclude-standard; } | shasum | cut -c1-40)"
marker="$(git rev-parse --git-dir)/skillup-verified"
[[ -f "$marker" && "$(cat "$marker")" == "$tree" ]] && exit 0

jq -n --arg r "Code changed since the last passing scripts/verify.sh ($(wc -l <<<"$code" | tr -d ' ') files). Run scripts/verify.sh (SKIP_TESTS=1 only for migration/config-only changes), fix any failure, and put its Evidence block in the PR. If you are only reporting a blocker, say so plainly instead." \
  '{decision: "block", reason: $r}'
