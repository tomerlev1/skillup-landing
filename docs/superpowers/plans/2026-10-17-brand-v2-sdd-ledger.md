# SDD ledger — plan: docs/superpowers/plans/2026-10-17-brand-v2-web-redesign.md

Spec: docs/superpowers/specs/2026-10-17-brand-v2-web-redesign-design.md
Branch: redesign/brand-v2 (feature branch in main checkout; restore tag pre-brand-v2). Start commit: 388f8fa

## Pre-flight scan

| Tasks | Shared file / interface | Finding |
|---|---|---|
| T2 → T11 | temporary aliases in globals.css (--mk-*, --bg/--fg, brand-600) | T2 adds, T11 removes. Consistent |
| T2 ↔ existing | Tailwind `ink` color vs existing `ink-100…ink-1000` scale | Names don't collide (`ink-2` ≠ `ink-200`); old scale must survive until T11 → Ruling R2 |
| T3 → T4/T6/T7/T9 | availabilityLabel, fetchNextSlots, getNextSlots | Signatures consistent across consumers |
| T4 → T6/T7/T9 | TeacherCard variants card/auto/wall, TeacherRail nextSlots/minCount, Avatar monogram, VerifiedMark | Consistent |
| T5 → T7 | GatedLink inline message; SupportWidget reads --sticky-bar-h, StickyBookingRail sets it | Consistent |
| T6 → T7 | `displayReviewerName` is consumed in T7 but T6's Interfaces block doesn't list it | Gap → Ruling R1 |
| T7 → T8 | src/lib/booking.ts (bookHref) extended in T8; booking.test.ts shared | Consistent (append) |
| T5 ↔ T10 | MarketNav touched by both | Sequential; T10 only changes copy |
| T11 guard ↔ T1–T10 | guard bans rounded-lg/xl…, alert(, legacy tokens | Intended to fail until T11 migration; earlier tasks needn't satisfy it |
| T1 | self-consistent | ok |
| T2 | tests vs code | ok |
| T3 | test dates: 2026-10-20 is Tuesday; IDT (UTC+3) until 2026-10-25 | verified values correct |
| T4 | tests vs teacherCardLines | ok |
| T5 | deletes list vs UAAwareStoreCTAs/AppLinkShell keep | ok, grep check mandated |
| T6 | pickWallTeachers/pickQuotes tests | ok |
| T7 | bookHref test | ok |
| T8 | safeNextPath etc tests | ok |
| T9–T11 | no unit tests beyond guard; browser checks | ok |

Ruling R1: T6 must also export `displayReviewerName(name: string): string` from src/lib/home-picks.ts (maps "תלמיד/ה"/empty → "תלמיד ב-SkillUp", else returns name), used by pickQuotes and T7 — the plan's T7 references it — costs a small refactor in T7 if wrong.
Ruling R2: The legacy `--color-ink-NNN`, `paper-*`, `dark-*` scales stay defined until T11 removes them; T2 only adds new tokens and aliases — avoids breaking every page mid-migration — cost if wrong: none, T11 guard catches leftovers.
Ruling R3: Work runs on the existing feature branch `redesign/brand-v2` in the main checkout instead of a new worktree — user is on this branch already, nothing else is checked out there — cost if wrong: none (revert via tag pre-brand-v2).

## Progress
Task 1: minor (deferred): vitest.config.ts uses __dirname; prefer fileURLToPath(import.meta.url) if package ever becomes type:module
Ruling R4: Commit trailer stays "Co-Authored-By: Claude Opus 5.5" as the session's attribution instruction specifies — subagent reminders name their own model — cost if wrong: trailer text only.
Task 1: complete (commits 388f8fa..d85287b, review clean)
Task 2: minor (deferred): .grad-text also deleted (unused outside landing) — scope extension, harmless
Task 2: minor (deferred): legacy --font-display/--font-mono-stack aliased to Rubik; .mono-sm 11px — remove in T11
Task 2: minor (deferred): ThemeToggle radiogroup lacks arrow-key nav
Task 2: minor (deferred): global a/button:focus-visible forces border-radius:4px, squares pill focus rings — fix in T11 (carry to T5/T11 dispatch)
Task 2: minor (deferred): theme script test is substring-only; could parse via new Function
Task 2: note: font variable classes moved from <body> to <html> (needed for --font-body resolution); ThemeToggle mounted in T5
Task 2: complete (commits d85287b..a1c5c00, review clean)
Task 3: minor (deferred): no DST-spanning / diff==6 boundary tests for availabilityLabel
Task 3: minor (deferred): fetchNextSlots error path not unit-tested
Task 3: minor (deferred): global limit 500 can crowd out teachers on very large id lists; 7x24h fetch window vs 6-day label cutoff (harmless)
Task 3: minor (deferred): commit 2c283ad trailer says "Claude Sonnet 5.5" instead of Opus 5.5 (cosmetic)
Task 3: complete (commits a1c5c00..2c283ad, review clean)
Task 4: minor (deferred): hardcoded #0B7A55/#0E9F6E/#FFF1E6 for on-photo pill and new-teacher pill — consider named tokens
Task 4: minor (deferred): rating/credential numbers use tnum without ltr-isolate
Task 4: minor (deferred): TeacherCard price uses local Intl.NumberFormat instead of formatPrice (drift risk)
Task 4: minor (deferred): RatingStars inline-block + "חדש ב-SkillUp" changes all callers — verify profile page (T7)
Task 4: minor (deferred): monogram() returns "" for letterless names; empty footer row when where+price null; availability pill 13px
Task 4: minor (deferred): SaveButton 32px < 44px tap target — carry to T9
Task 4: check-later: light-dark() in RatingStars needs color-scheme set by tokens — verify in dark mode during final pass
Task 4: complete (commits 2c283ad..fb1ff59, review clean)
Task 5: minor (deferred): theme row div+radiogroup inside role="menu" — use role="none" wrapper
Task 5: minor (deferred): GatedLink new <span class="relative block"> wrapper may change layout for flex/grid callers — check in T7
Task 5: minor (deferred): Light logo SVG used in dark mode (dark asset exists: public/images/SkillUp-SignIn-Logo-dark.svg) — T11
Task 5: minor (deferred): AppStoreButtons still legacy --mk tokens + 9px label — T11
Task 5: minor (deferred): a11y statement factual claims need owner confirmation (banner covers); duplicate legal heading classes; SupportWidget 52px literal
Task 5: unverified browser states: logged-in menu ThemeToggle fit, teacher popover, /accessibility at 375, open SupportWidget — check in final pass
Ruling R5: bg-action with white text fails AA in dark mode (#8B85FF vs white ≈3:1) — add token --c-on-action (light #FFFFFF, dark #100E22; Tailwind `on-action`) and use `text-on-action` on every bg-action surface; implemented in T6 across existing usages — cost if wrong: one token + class swap.
Task 5: complete (commits fb1ff59..c09a29a, review clean)
Task 6: minor (deferred): HeroWall no-wall fallback search wrapper lacks mx-auto — fix carried into T7
Task 6: minor (deferred): buildGoalTiles untested; getCategories/getFeaturedTeachers not wrapped in safe; quotes rely on featured sort:rating (add comment)
Task 6: minor (deferred): .faq padding change also affects /faq (correct fix)
Task 6: data note for owner: dev teacher "App Review" avatar is a login screenshot showing credentials and qualifies for the hero wall; 4/5 goal tiles empty in dev (9 teachers); "מבוגרים" query unverified in prod
Ruling R6: Guest screens showed two indigo fills (nav "הרשמה" + content primary). The nav signup becomes ink-filled (bg-ink text-surface, hover bg-ink-2) and the ForTeachersPanel CTA becomes ink-filled too, so indigo stays with the page's own primary (search orb / booking) — spec "one indigo primary per screen" wins over §8.1's "הרשמה primary in nav" — cost if wrong: two class swaps. Implemented in T7 dispatch.
Task 6: complete (commits c09a29a..61bcb13, review clean)
Task 7: minor (deferred): cover Image priority while hidden <md; two Avatars per breakpoint; SaveButton saved-state raw red-500; no test for AvailabilityPreview day grouping
Task 7: minor (deferred, carry to T8): AvailabilityPreview groups days by UTC start_at.slice(0,10) — near-midnight Israel slots mislabeled (pre-existing); wizard has same pattern
Task 7: fix round 1 dispatched (findings: --sticky-bar-h set on desktop; <14px text in restyled profile/rail) — FIX_BASE 3876ed9
Task 7: fix round 1/5 (2 addressed, 0 open; commits 3876ed9..3e83908)
Task 7: complete (commits 61bcb13..3e83908, review clean after 1 fix round)
Task 8: minor (deferred): safe-next.ts dead colon<firstSlash check
Task 8: minor (deferred, should fix in final wave): wizard empty state uses slots.length===0, so single-mode teacher whose slots all exclude that mode shows empty strip with no message; misfit for fixed single mode only flagged at step 2
Task 8: minor (deferred): resolvePreselectedSlot new Date() SSR vs hydration (negligible)
Task 8: note for owner: logged-in wizard + live create_booking + .ics download not exercised (no logins allowed); build needs network for next/font Google Fonts; /tutors/<non-uuid> returns 500 (pre-existing)
Task 8: fix round 1 dispatched (ICS ';' not escaped, test asserts bug) — FIX_BASE 0c5889f
Task 8: fix round 1/5 (1 addressed, 0 open; commits 0c5889f..c4cec29)
Task 8: minor (deferred): ics escapeText leaves lone \r
Task 8: complete (commits 3e83908..c4cec29, review clean after 1 fix round)
Task 9: minor (deferred, carry to T11): chips sm h-9 / md h-10, active-filter links h-9, sort button h-10, city-remove X 32px — below 44px
Task 9: minor (deferred, carry to T11): TeacherGridSkeleton still grid-cols-2 sm:3 — match 1/md:3/xl:4
Task 9: minor (deferred): extra sequential getNextSlots round trip on search/city (acceptable)
Task 9: note: availability label never seen rendered (dev has 0 open slots in 7 days; seeding would be a DB write — not allowed); load-more unexercised (9 teachers). Implementer wrote no report file; controller transcribed hand-back.
Task 9: complete (commits c4cec29..d3b07bd, review clean)
Task 10: minor (deferred): completed status uses ink-3 on canvas; warn text on warn/10 ~4.3–4.5:1 borderline; ChatThread "{name} מקלידים..." plural verb for one person (brief-mandated); AuthShell light logo in dark mode (T11)
Task 10: fix round 1 dispatched (ScheduleManager open slot raw emerald + text-white) — FIX_BASE 146f8f6
Task 10: fix round 1/5 (1 addressed, 0 open; commits 146f8f6..a77e4fd)
Task 10: minor (deferred): ScheduleManager open-slot light hover bg-ok/20 → ~4.3:1 (use /15) — carry to T11
Task 10: complete (commits d3b07bd..a77e4fd, review clean after 1 fix round)
Task 11: minor (deferred): wizard empty-state copy "היומן מלא" inaccurate when slots exist but none fit mode — use "אין כרגע מועדים פנויים ל{mode}"
Task 11: minor (deferred): UAAwareStoreCTAs 12px labels; how-it-works numerals in serif (mild §7.2 stretch)
Task 11: minor (deferred): signup submit says "יצירת חשבון" vs glossary "הרשמה"
Task 11: minor (deferred): /forgot-password, /unsubscribe, /verify-email default titles (pre-existing)
Ruling R7: 44px tap-target rule applies to buttons/controls; text links in footer lists and inline auth links get a ≥24px hit area (WCAG 2.2 AA 2.5.8; inline text links are exempt) instead of 44px — keeps the footer compact — cost if wrong: footer padding tweak.
Task 11: complete (commits a77e4fd..c2852cf, review clean)
Final review: With fixes — 4 Important (FAQ/JSON-LD cancellation+verification claims; support KB 24h promise + old flow; warn/danger text contrast; a11y statement 44px claim) + 5 fix-before-merge + cheap minors → final-findings.md; fix wave dispatched from c2852cf
Ruling R8: ensure-role-row default teacher display_name "מורה חדש/ה" → "מורה ב-SkillUp" (string written to shared DB on new teacher rows) is kept — required by the no-slash rule, not a schema change — cost if wrong: apps show a different placeholder name for brand-new teachers; owner informed.
Ruling R9: Add --c-spark-text (#C2410C light) for text-colored spark accents; spec's #F97316 stays for non-text marks — the hero accent at 2.8:1 fails even large-text AA — cost if wrong: slightly darker orange accent word.
Final fix wave: 15/15 addressed (commits c2852cf..1c10cd0), re-review clean. Controller browser spot-check: home 1440 light/dark, profile + search 375 OK; support-button transition frozen in preview pane (CSS computes 92px) — environment artifact.
