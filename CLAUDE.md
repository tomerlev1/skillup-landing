@AGENTS.md

## Claude Code only
- Committed hook `.claude/hooks/skillup-guardrail.sh` (wired in `.claude/settings.json`, same file as in skillup-ios):
  **denies** `git push` to main/master; **asks** before prod Supabase MCP writes, `gh pr merge`, enabling auto-merge,
  and any Bash command naming the prod ref. It also covers `run_in_terminal` and desktop-commander processes.
- No `.mcp.json` and no repo skills here.
