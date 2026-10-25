# Status: skillup-landing (updated 2026-10-25 by agent)

## Live
- Nothing. The repo has no deployments. `skillupwebsite.vercel.app` is still served by `../SkillUpTeam`
  (checked 2026-10-25: `/search` returns 404 there).
- `main` = `aceea94` (tutor availability calendar). Remote branches: `main`, `marketplace` (old).

## Health at `aceea94` (checked 2026-10-25)
- `npm test`: 108 tests pass (11 files). `npm run lint`: 14 errors. No CI.
- No error, not-found or loading pages yet.

## Blockers (owner)
- No Vercel project for this repo yet, per the 2026-10-21 audit (0 deployments; Vercel side UNVERIFIED today). Founders.
- A prod build needs backend objects that exist only on DEV (`search_teachers_public`, `get_teacher_reviews_public`,
  `support_requests`), per the 2026-10-21 audit. UNVERIFIED today. Fix is a migration in `../skillup-ios/supabase`.
- Push access: a branch ruleset blocked Harel's pushes until 2026-10-23; it is disabled now. Re-check before relying on it (Tomer).

## In flight
- Nothing tracked here. Web work items live in `Harelzx/skillup-platform` (label `platform:web`).

## Next 3
1. Create the Vercel project and a preview deploy (founders).
2. Ship the missing backend objects to prod (backend repo, founder approves the SQL).
3. Fix the 14 lint errors and add Hebrew error / 404 / loading pages.
