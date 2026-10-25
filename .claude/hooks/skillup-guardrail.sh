#!/usr/bin/env bash
# SkillUp agent guardrail (Claude Code PreToolUse hook).
#
# - Supabase MCP writes against PROD (ntofcpjwulypvjcsytqv) -> "ask": a human
#   confirms every call. Reads are untouched; execute_sql always asks on prod
#   because SQL can't be reliably classified as read-only (functions write).
# - `git push` to main/master (explicit refspec, or a bare push while on
#   main/master) -> "deny". A main push ships Xcode Cloud -> TestFlight.
# - `gh pr merge` -> "ask" (admin merges need per-PR approval).
# - Any other Bash command naming the prod project ref -> "ask".
# - The same Bash checks apply to the desktop terminal (run_in_terminal) and
#   desktop-commander processes, which would otherwise bypass this hook.
# - Turning on auto-merge through the desktop PR tool -> "ask".
#
# Escape hatch for a knowingly approved push: SKILLUP_ALLOW_PUSH_MAIN=1.
set -euo pipefail

PROD_REF="ntofcpjwulypvjcsytqv"
input="$(cat)"
tool="$(jq -r '.tool_name // ""' <<<"$input")"

decide() { # $1 = ask|deny, $2 = reason
  jq -n --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $d, permissionDecisionReason: $r}}'
  exit 0
}

case "$tool" in
  mcp__*supabase*__apply_migration | mcp__*supabase*__execute_sql | \
  mcp__*supabase*__deploy_edge_function | mcp__*supabase*__merge_branch | \
  mcp__*supabase*__pause_project | mcp__*supabase*__restore_project)
    project="$(jq -r '.tool_input.project_id // ""' <<<"$input")"
    if [[ "$project" == "$PROD_REF" || "$tool" == mcp__supabase-prod__* ]]; then
      decide ask "PROD Supabase ($PROD_REF): ${tool##*__}. Show Harel the exact change and get explicit approval first."
    fi
    ;;
  mcp__ccd_pr__set_auto_merge)
    decide ask "Auto-merge merges without a further click. Needs Harel's explicit approval for this PR."
    ;;
  Bash | mcp__terminal__run_in_terminal | mcp__*desktop-commander*__start_process | \
  mcp__*desktop-commander*__interact_with_process)
    cmd="$(jq -r '.tool_input.command // .tool_input.input // ""' <<<"$input")"
    cwd="$(jq -r '.cwd // ""' <<<"$input")"
    if [[ "${SKILLUP_ALLOW_PUSH_MAIN:-}" != "1" ]]; then
      # Judge each `git push` segment on its own (up to ; & | or end of line),
      # so e.g. `gh pr create --base main` after a branch push isn't a match.
      while IFS= read -r seg; do
        [[ -z "$seg" ]] && continue
        # Explicit main/master target: `origin main`, `HEAD:main`, `+main`, `refs/heads/main`.
        if grep -Eq 'push\b.*([[:space:]]|:|\+|refs/heads/)(main|master)([[:space:]]|$)' <<<"$seg"; then
          decide deny "Blocked: git push to main/master triggers Xcode Cloud -> TestFlight. Push a branch and open a PR."
        fi
        # Bare push (no refspec after the remote) while the checkout is on main/master.
        # Deleting a remote branch other than main/master is fine from any checkout.
        if grep -Eq 'push\b.*[[:space:]](--delete|-d)([[:space:]]|$)' <<<"$seg"; then
          continue
        fi
        dir="$(sed -nE 's/.*git[[:space:]]+-C[[:space:]]+([^[:space:]]+).*/\1/p' <<<"$seg")"
        branch="$(git -C "${dir:-${cwd:-.}}" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
        if [[ "$branch" == "main" || "$branch" == "master" ]] &&
          ! grep -Eq 'push\b([[:space:]]+-[^[:space:]]+)*[[:space:]]+[^-[:space:]][^[:space:]]*[[:space:]]+[^-[:space:]]' <<<"$seg"; then
          decide deny "Blocked: this checkout is on $branch, so a bare git push goes to $branch. Push a branch and open a PR."
        fi
      done < <(grep -oE '(^|[;&|[:space:]])git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+push\b[^;&|]*' <<<"$cmd" || true)
    fi
    if grep -Eq '(^|[;&|[:space:]])gh[[:space:]]+pr[[:space:]]+merge\b' <<<"$cmd"; then
      decide ask "gh pr merge: merging needs Harel's explicit approval for this PR."
    fi
    if grep -q "$PROD_REF" <<<"$cmd"; then
      decide ask "This command names the PROD Supabase project ($PROD_REF). Confirm it is approved."
    fi
    ;;
esac
exit 0
