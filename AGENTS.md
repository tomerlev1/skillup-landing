# SkillUp Web (marketplace): agent guide

The **real SkillUp web client**: search, tutor pages, booking, messages, account, saved tutors, the tutor availability
calendar, plus marketing and legal pages. Next.js 16.1.6 (App Router) · React 19.2.3 · Tailwind v4 · supabase-js +
`@supabase/ssr`. Hebrew, RTL.

**Not deployed yet.** The live site `skillupwebsite.vercel.app` is still served by the frozen `../SkillUpTeam` repo.
Public repo, owner `tomerlev1`. Nothing secret or security-related goes in here: not in code, docs, issues or PR text.

Read `STATUS.md` next. Open web work: `gh issue list -R Harelzx/skillup-platform --label platform:web`.

## Commands
| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Tests | `npm test` (vitest, `src/lib/__tests__/`, includes the brand guards) |
| Build | `npm run build` |
CI (`.github/workflows/ci.yml`, "Types & Tests"): `tsc --noEmit` and Vitest must pass. ESLint runs as report-only until the
14 existing React Compiler errors are fixed. CI has no `next build` (static pages need Supabase), so run the build locally
and paste the result in the PR.
Next 16 has breaking changes from older Next.js (for example `src/proxy.ts` replaces middleware). 16.1.6 ships no docs in
`node_modules/next/dist/docs/`, so check the Next.js 16 docs online before using an unfamiliar API.

## Layout
- `src/app/(market)/`: all site pages (home, search, tutors, bookings, messages, account, saved, articles, categories,
  cities, login/signup, legal).
- App-link pages: `src/app/{teacher/[id],dev/teacher/[id],lesson/[id],chat/[id],verify-email,settings/notifications,unsubscribe}`
  and `src/app/(market)/policy`.
- Route handlers: `src/app/api/support-chat`, `src/app/auth/callback`.
- `src/proxy.ts` refreshes the Supabase session on every non-asset request (`.well-known` is excluded).
- `src/lib/data/`: data access. `src/lib/supabase/`: clients. `src/components/<area>/`: UI.

## Environments
- Local: `.env.local` (gitignored), copied from `.env.example`, pointing to DEV Supabase `hjgumjfrljoietbzciyl`. Never point local at prod.
- Prod Supabase `ntofcpjwulypvjcsytqv` belongs only in the Vercel Production env, once a Vercel project exists (none yet).
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY` (server only, optional
  support-chat fallback), `NEXT_PUBLIC_A11Y_APPROVED`. Never put a service-role key or any secret in a `NEXT_PUBLIC_*` variable.
- `src/app/verify-email/page.tsx` hardcodes the prod Supabase URL. The site URL is `SITE_URL` in `src/lib/constants.ts`,
  but `skillupwebsite.vercel.app` is also written literally in several pages, `public/robots.txt` and `public/llms.txt`.

## Rules
- Brand: radii only via `--r-sm`, `--r-md`, `--r-lg`, `--r-pill` and colors only from the tokens in `src/app/globals.css`.
  `src/lib/__tests__/brand-guards.test.ts` fails otherwise.
- The app-link pages above and `public/.well-known/{apple-app-site-association,assetlinks.json}` must keep working. Don't
  delete, rename or move them. The SkillUp apps open these paths, and this repo is meant to take over the live URL.
  Keep the `.well-known` files byte-identical to `../SkillUpTeam` (they are today).
- Backend: there is no `supabase/` here. Schema, RPCs and migrations live in `../skillup-ios/supabase`. If you need a new
  RPC, table or column, open a backend issue first. Changes go to DEV first and to prod only after a founder approves.
- Shared contract in `../skillup-platform`: feature registry, parity matrix, RPC contracts and generated DB types. Design tokens are not there yet.

## Definition of done (proof pack)
A change is done only when a machine has checked the proof, not when it looks done.
1. **Acceptance first:** write the acceptance list in the issue or PR before coding. Bug fix: a test that fails before
   the fix and passes after.
2. **`scripts/verify.sh`** passes on the final tree (tsc, Vitest, no new ESLint errors). It prints an Evidence block.
3. **Evidence in the PR** (template in `.github/pull_request_template.md`): `Commit: <head sha>`, the verify output, and
   for UI changes (`src/app/`, `src/components/`, `public/`) at least one screenshot embedded in the PR body. The
   "Evidence check" CI job fails if it is missing, was taken on an older commit, or the PR links no issue.
4. **Independent check:** run the `verifier` subagent (`.claude/agents/verifier.md`) on the PR and fix every FAIL item.
5. Only then ask Harel for the merge click, with a plain-Hebrew evidence summary.
- Claude Code: a Stop hook (`.claude/hooks/verify-before-stop.sh`) blocks ending a session with code changes that
  `scripts/verify.sh` has not passed.

## Git
Branch → PR to `main` (Tomer owns the repo). Every PR must link its issue (`Fixes #N`, `Closes #N` or `Part of owner/repo#N`); CI fails without it. Harel does not merge: when the PR is ready, ask him for a merge click, then the agent runs `gh pr merge <n> --squash --delete-branch`. Never push to `main`. No Vercel previews yet.
