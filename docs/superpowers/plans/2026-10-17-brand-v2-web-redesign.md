# SkillUp Web Brand v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move skillup-web onto the Brand v2 design system and rebuild its key screens: a light "teachers are the heroes" home page, a new teacher card with next-available slot, a compact profile, and a time-first booking flow. No database changes.

**Architecture:** Semantic CSS tokens (light + dark) in `globals.css` drive Tailwind v4 utilities. The old token families are aliased to them during migration, then removed. Pure logic (availability labels, wall/quote picking, ICS, safe redirects, theme) lives in small `src/lib/*` modules with Vitest unit tests. UI is verified with build, lint, a source guard test, and browser checks at 375px and 1440px in light and dark modes.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4 (`@theme inline`), lucide-react, Supabase JS (read-only queries against existing tables/RPCs), Vitest (new dev dependency, tests only).

**Spec:** `docs/superpowers/specs/2026-10-17-brand-v2-web-redesign-design.md`. Read it first. Section numbers below (§) refer to it.

## Global Constraints

- **No database changes:** no migrations, tables, columns, or RPCs. New *reads* of existing tables are allowed (e.g. `availability_slots`).
- **Out of scope:** `src/lib/legal-content.ts` text (the owner replaces it). iOS and Android apps.
- **RTL:** Hebrew-only UI with `dir="rtl"`. Numbers, prices and times go in `ltr-isolate tnum`.
- **Copy:**
  - Address users in plural.
  - No gendered slashes (e.g. `תלמיד/ה`), no exclamation marks, no unproven superlatives.
  - Never imply SkillUp charges students.
  - Transparency line, verbatim: `התשלום והביטול נקבעים ישירות מול המורה. SkillUp לא גובה מכם כלום.`
- **Fonts:** Rubik 400/500/600/700 for all UI. Frank Ruhl Libre 700/900 only for editorial moments (§7.2). Heebo and JetBrains Mono are removed from the site (`app/_og` fonts for the OG image may stay).
- **Text sizes:** minimum 14px for readable text. 12px only for tiny tags and counters.
- **Radii:** only `--r-sm: 10px`, `--r-md: 16px`, `--r-pill: 999px`.
- **Color:**
  - Exactly the §7.1 tokens.
  - Exactly one indigo primary action per screen.
  - One star color, `#F5A623`.
  - No per-category colors.
  - No large dark surfaces in light mode.
- **Motion:**
  - 150–250ms with `cubic-bezier(.2,.8,.2,1)`. Respect `prefers-reduced-motion`.
  - Remove `title-gradient`, `orb-glow`, marquee/kinetic and button shimmer. Keep the search typewriter.
- **Targets and rendering:**
  - Tap targets at least 44×44.
  - Public pages stay static/ISR: never read cookies in `app/(market)/layout.tsx`.
- **SEO stays:** metadata, JSON-LD, sitemap, city and category pages.

## Review Focus

1. **Stale `?slot=` id** (slot booked or past, or belongs to another teacher). Expected: the wizard opens on step 1 with a short notice ("המועד שבחרתם כבר לא פנוי, בחרו מועד אחר") and no crash. Tested in Task 8 (`resolvePreselectedSlot`).
2. **Unsafe `next` after login** (`//evil.com`, `https://…`, `javascript:`). Expected: fall back to `/`. A `?slot=` must survive the email and Google login round-trip. Tested in Task 8 (`safeNextPath`).
3. **Timezone edge.** The server runs in UTC, but "היום/מחר" must be computed in `Asia/Jerusalem`: a slot at 00:30 Israel time on the next day reads "מחר". Tested in Task 3.
4. **Sparse teacher data:**
   - `hourly_rate` null → no price row, the footer still aligns.
   - `lesson_modes` null or `subjects` empty → the line is omitted.
   - No avatar → monogram.
   - `review_count` 0 → "חדש ב-SkillUp".
   - Tested in Task 4 (`teacherCardLines`).
5. **Teacher-role user clicks a slot or "קביעת שיעור".** Expected: an inline message, not `alert()`; teachers can't book. Implemented in Task 7 (GatedLink) and checked in the browser.

---

## File Map

| Area | Files |
|---|---|
| Test infra | Create `vitest.config.ts`, `src/lib/__tests__/*.test.ts`; modify `package.json` |
| Tokens/fonts/theme | Modify `src/app/globals.css`, `src/app/layout.tsx`; create `src/lib/theme.ts`, `src/components/ui/ThemeToggle.tsx` |
| Availability | Create `src/lib/availability-label.ts`; modify `src/lib/data/availability.ts` |
| Card system | Modify `src/components/market/TeacherCard.tsx`, `TeacherRail.tsx`, `src/components/ui/RatingStars.tsx`, `Avatar.tsx`, `Skeleton.tsx`; create `src/components/ui/VerifiedMark.tsx`, `src/lib/teacher-card.ts` |
| Shell | Modify `MarketNav.tsx`, `MarketFooter.tsx`, `SupportWidget.tsx`, `GatedLink.tsx`; move `app/privacy`, `app/terms`, `app/policy` into `app/(market)/`; create `app/(market)/accessibility/page.tsx`; delete `components/landing/*`, `components/layout/Navbar.tsx`, `Footer.tsx`, `components/ui/Button.tsx`, unused helpers |
| Home | Rewrite `app/(market)/page.tsx`; create `src/lib/data/home.ts`, `src/lib/home-picks.ts`, `src/components/home/*` |
| Profile | Modify `app/(market)/tutors/[id]/page.tsx`, `StickyBookingRail.tsx`, `ReviewsSection.tsx` |
| Booking | Modify `app/(market)/tutors/[id]/book/page.tsx`, `BookingWizard.tsx`; create `src/lib/booking.ts`, `src/lib/ics.ts`, `src/lib/safe-next.ts` |
| Search | Modify `search/page.tsx`, `ResultsGrid.tsx`, `FilterPanel.tsx`, `SearchToolbar.tsx`, `ActiveFilters.tsx`, `SearchPill.tsx`, `cities/[slug]`, `categories/[slug]`, `saved` |
| Account/Auth | Modify `bookings/page.tsx`, `messages/*`, `ChatThread.tsx`, `AccountForm.tsx`, `ScheduleManager.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `AuthShell.tsx`, `GoogleButton.tsx` |
| Guards | Create `src/lib/__tests__/brand-guards.test.ts` |

---

### Task 1: Test harness

**Files:**
- Modify: `package.json` (scripts `"test": "vitest run"`; devDependency `vitest`)
- Create: `vitest.config.ts` (resolve alias `@` → `./src`, `environment: "node"`, `include: ["src/**/*.test.ts"]`)
- Test: `src/lib/__tests__/smoke.test.ts`

**Interfaces:** Produces `npm test`.

- [ ] **Step 1:** Install: `npm i -D vitest@^3`
- [ ] **Step 2:** Write `smoke.test.ts`. It imports `formatPrice` from `@/lib/format` and asserts that the output contains `150`.
- [ ] **Step 3:** Run `npm test`. Expected: 1 passed.
- [ ] **Step 4:** Commit: `git add package.json package-lock.json vitest.config.ts src/lib/__tests__/smoke.test.ts && git commit -m "chore: add vitest"`

### Task 2: Design tokens, fonts, dark mode

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/lib/theme.ts`, `src/components/ui/ThemeToggle.tsx`
- Test: `src/lib/__tests__/theme.test.ts`

**Interfaces:**
- Produces:
  - CSS variables `--c-action`, `--c-action-hover`, `--c-action-soft`, `--c-spark`, `--c-ink`, `--c-ink-2`, `--c-ink-3`, `--c-canvas`, `--c-surface`, `--c-line`, `--c-ok`, `--c-ok-text`, `--c-warn`, `--c-danger`, `--c-star`, `--r-sm`, `--r-md`, `--r-pill`, `--shadow-lift`, `--ease`, `--font-ui`, `--font-ed`.
  - Tailwind colors `action`, `action-hover`, `action-soft`, `spark`, `ink`, `ink-2`, `ink-3`, `canvas`, `surface`, `line`, `ok`, `ok-text`, `warn`, `danger`, `star`, so classes like `bg-surface` and `text-ink-3` work.
  - Utilities `.font-ed`, `.eyebrow` (Rubik 500, 13px, no tracking or uppercase), `.tnum`, `.ltr-isolate`.
  - `type ThemePref = "light" | "dark" | "system"`
  - `resolveTheme(pref: ThemePref, systemDark: boolean): "light" | "dark"`
  - `THEME_STORAGE_KEY = "skillup-theme"`
  - `themeInitScript: string` (inline `<head>` script that sets `data-theme` on `<html>` before paint)
  - `<ThemeToggle />` (3-way segmented control: בהיר / כהה / לפי המכשיר)

- [ ] **Step 1: Write the failing test** (`theme.test.ts`):
  - `resolveTheme("light", true) === "light"`
  - `resolveTheme("dark", false) === "dark"`
  - `resolveTheme("system", true) === "dark"`
  - `resolveTheme("system", false) === "light"`
  - `themeInitScript` contains `"skillup-theme"` and `data-theme`
- [ ] **Step 2:** Run `npm test -- theme`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `src/lib/theme.ts`. The init script reads localStorage inside try/catch and falls back to `matchMedia`.
- [ ] **Step 4:** Rewrite tokens in `globals.css`:
  - Light values go on `:root`.
  - Dark values go on `:root[data-theme="dark"]`. The init script always sets the attribute; with no attribute the page renders light.
  - Map the old names to the new tokens as **temporary aliases**: `--mk-ink`→`--c-ink`, `--mk-ink-2`→`--c-ink-2`, `--mk-ink-3`→`--c-ink-3`, `--mk-hairline`→`--c-line`, `--mk-band`→`--c-canvas`, `--bg`→`--c-canvas`, `--fg`→`--c-ink`, and `brand-600`→`--c-action`. The site then switches palette at once; later tasks remove the aliases.
  - Delete `.title-gradient`, `.orb-glow`, `.marquee*`, `.kinetic*`, `.bento*`, `.glass-card`, `.section-bloom`, `.gradient-text*`, `.nav-progress*`, `@keyframes shimmer/phone-float/glow-pulse`.
  - Keep `.skeleton`, `.rise-in`, `.caret`, `.faq`, `.no-scrollbar`.
- [ ] **Step 5:** In `layout.tsx`:
  - Load `Rubik` (hebrew+latin, 400–700) and `Frank_Ruhl_Libre` (hebrew+latin, 700, 900) via `next/font/google` as `--font-family-rubik` / `--font-family-frank`. Remove Heebo and JetBrains.
  - Add `<script dangerouslySetInnerHTML={{__html: themeInitScript}} />` first in `<head>`.
  - Add `suppressHydrationWarning` on `<html>`.
- [ ] **Step 6:** Run `npm test && npm run build`. Expected: tests pass, build succeeds.
- [ ] **Step 7:** Start the `skillup-web` preview. Load `/` at 1440px. Expected: light canvas `#F6F6FA`, Rubik text, no console errors. Set `localStorage["skillup-theme"]="dark"` and reload. Expected: dark canvas `#100E22` with no flash.
- [ ] **Step 8:** Commit: `feat(brand): v2 tokens, fonts, dark mode`

### Task 3: Availability label + next-slot fetch

**Files:**
- Create: `src/lib/availability-label.ts`
- Modify: `src/lib/data/availability.ts`
- Test: `src/lib/__tests__/availability-label.test.ts`

**Interfaces:**
- Produces:
  - `availabilityLabel(startIso: string, now: Date): string | null`. Format: `"יש מקום היום · 19:30"`, `"יש מקום מחר · 17:00"`, `"יש מקום ביום ד׳ · 16:00"`. Returns `null` when the slot is more than 6 calendar days ahead or in the past. All day math in `Asia/Jerusalem`. Weekday names: `א׳ ב׳ ג׳ ד׳ ה׳ ו׳ שבת` (Saturday → `"יש מקום בשבת · …"`).
  - `availabilityTime(startIso: string): string` (`"17:00"`, Jerusalem time, 24h).
  - `fetchNextSlots(supabase: SupabaseClient, teacherIds: string[], now?: Date): Promise<Record<string, AvailabilitySlot>>`. One query: `.in("teacher_id", ids).eq("is_booked", false)`, `start_at` from now to now + 7 days, ordered ascending, limit 500. Keeps the first slot per teacher. Returns `{}` for an empty `ids` list without a query.
  - `getNextSlots(teacherIds: string[]): Promise<Record<string, AvailabilitySlot>>`: the server wrapper using `createPublicClient()`.

- [ ] **Step 1: Write the failing tests.** Fixed `now = new Date("2026-10-20T09:00:00Z")` (Tuesday, 12:00 Israel time):
  - `availabilityLabel("2026-10-20T16:30:00Z", now) === "יש מקום היום · 19:30"`
  - `availabilityLabel("2026-10-21T14:00:00Z", now) === "יש מקום מחר · 17:00"`
  - `availabilityLabel("2026-10-20T21:30:00Z", now) === "יש מקום מחר · 00:30"` (UTC same day, Israel next day; Review Focus 3)
  - `availabilityLabel("2026-10-22T13:00:00Z", now) === "יש מקום ביום ה׳ · 16:00"`
  - `availabilityLabel("2026-10-27T13:00:00Z", now) === null` (7 days ahead)
  - `availabilityLabel("2026-10-20T08:00:00Z", now) === null` (past)
- [ ] **Step 2:** Run `npm test -- availability`. Expected: FAIL.
- [ ] **Step 3:** Implement with `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" })` to get calendar dates, and the difference in days between them.
- [ ] **Step 4:** Implement `fetchNextSlots` / `getNextSlots` in `availability.ts` next to `getUpcomingSlots`.
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit: `feat: availability label and batched next-slot lookup`

### Task 4: Teacher card system

**Files:**
- Create: `src/lib/teacher-card.ts`, `src/components/ui/VerifiedMark.tsx`
- Modify: `src/components/market/TeacherCard.tsx`, `TeacherRail.tsx`, `src/components/ui/RatingStars.tsx`, `Avatar.tsx`, `Skeleton.tsx`
- Test: `src/lib/__tests__/teacher-card.test.ts`

**Interfaces:**
- Consumes: `availabilityLabel` (Task 3), tokens (Task 2).
- Produces:
  - `teacherCardLines(t: TeacherCard): { subjects: string | null; credentials: string | null; where: string | null; price: number | null; isNew: boolean }`
    - `subjects`: first 3 joined with `" · "`.
    - `credentials`: `"{n} שנות ניסיון · {m}+ תלמידים"`, each part only if > 0. If `n` is 1: `"שנת ניסיון אחת"`.
    - `where`: city plus a mode phrase. With `online` and other modes → `"{city} · גם אונליין"`. Only `online` → `"אונליין"`. Only `teacher_home` → `"{city} · אצל המורה"`. Only `student_home` → `"{city} · אצלכם בבית"`. Otherwise `"{city} · " + labels joined with " · "`.
    - `isNew`: `review_count === 0`.
  - `<TeacherCard teacher nextSlot?: AvailabilitySlot | null variant?: "card" | "auto" | "wall" priority? />`
    - `"card"`: §8.2 grid card.
    - `"auto"`: the row layout under `md` and the card layout from `md` up, in one DOM tree via responsive classes.
    - `"wall"`: photo 4:5, name, first subject, availability.
  - `<VerifiedMark size?: 16|18 />`: indigo circle with a white check, `aria-label="פרופיל מאומת על ידי SkillUp"` and a `title` with the same text.
  - `<RatingStars>`: star `#F5A623` only. For 0 reviews it renders `"חדש ב-SkillUp"` with spark text on `#FFF1E6`, pill, 12px.
  - `<Avatar>`: fallback is a monogram (first letter, `font-ed` 900, `--c-action` on `--c-action-soft`).
  - `<TeacherRail title teachers nextSlots?: Record<string, AvailabilitySlot> moreHref? minCount?: number />`: returns `null` when `teachers.length < (minCount ?? 4)`.

- [ ] **Step 1: Write the failing tests** for `teacherCardLines` (Review Focus 4):
  - `hourly_rate` null → `price === null`.
  - `subjects` empty → `subjects === null`.
  - Modes `["online","teacher_home"]` + city `"חיפה"` → `where === "חיפה · גם אונליין"`.
  - `experience_years` 7, `total_students` 40 → `"7 שנות ניסיון · 40+ תלמידים"`.
  - `experience_years` null, `total_students` 0 → `credentials === null`.
  - `review_count` 0 → `isNew === true`.
- [ ] **Step 2:** Run `npm test -- teacher-card`. Expected: FAIL.
- [ ] **Step 3:** Implement `teacherCardLines`.
- [ ] **Step 4:** Rebuild `TeacherCard.tsx` per spec §8.2 and the approved mockup (`.superpowers/brainstorm/*/content/teacher-card-v2.html`):
  - The whole card is a single `<Link>`; no "לפרופיל" button. `SaveButton` stays absolutely positioned outside the link.
  - Availability pill bottom-right on the photo. Name `truncate`. Price row pinned with `mt-auto`.
  - Row variant: image `96×120`, `rounded-[var(--r-sm)]`.
- [ ] **Step 5:** Update `TeacherRail`:
  - New `nextSlots` and `minCount` props, title in `font-ed` 700.
  - On mobile, a horizontal snap rail of `variant="card"` at `w-[72vw] max-w-[280px]`. From `sm` up, a grid.
  - Update `Skeleton.tsx` so card skeletons match the new geometry (4:5 photo).
- [ ] **Step 6:** Run `npm test && npm run build`. Expected: PASS.
- [ ] **Step 7:** In the browser at 1440px and 375px on `/search` and `/`, check:
  - Cards in a row share the same height.
  - Name and rating sit on one baseline.
  - A long name truncates.
  - A teacher with no photo shows the monogram.
  - No indigo price pill.
- [ ] **Step 8:** Commit: `feat(card): teacher card v2 with availability`

### Task 5: Shell: nav, footer, legal pages, accessibility, cleanup

**Files:**
- Modify: `src/components/market/MarketNav.tsx`, `MarketFooter.tsx`, `src/components/support/SupportWidget.tsx`, `src/components/market/GatedLink.tsx`, `src/components/layout/LegalPageLayout.tsx`
- Move: `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/policy/page.tsx` → `src/app/(market)/{privacy,terms,policy}/page.tsx`
- Create: `src/app/(market)/accessibility/page.tsx`
- Delete: `src/components/landing/*`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Eyebrow.tsx`, `src/components/ui/SectionDivider.tsx`, `src/components/ui/StoreButtons.tsx`, `src/components/animations/ScrollReveal.tsx`, `src/components/phone/*`, `src/components/icons/CustomIcons.tsx`, `public/images/illustrations/teacher-student.png`. Before each delete, `grep -rn "<Name>" src` must show no remaining importer outside the deleted set. `UAAwareStoreCTAs` and `AppLinkShell` stay: they are used by deep-link pages.

**Interfaces:**
- Consumes: `ThemeToggle` (Task 2).
- Produces: `GatedLink` with the same props, and an inline popover message instead of `alert()` for teachers. Text: `"קביעת שיעורים זמינה לחשבונות של לומדים. מורים מנהלים שיעורים מהאפליקציה."`

- [ ] **Step 1: MarketNav.**
  - Links: `מציאת מורה`, `מקצועות` (dropdown), `איך זה עובד`, `למורים`.
  - Guest: `התחברות` text link plus `הרשמה` (`bg-action`).
  - Remove the scroll-progress bar. Restyle the dropdown and mobile panel with tokens; selected states use `bg-action-soft`.
  - The logged-in user menu gets a `ערכת צבע` row with `<ThemeToggle />`.
  - `CategoryIcon` ignores its `color` prop (always `currentColor`, ink on a `bg-canvas` tile) and uses `strokeWidth={1.75}`.
- [ ] **Step 2: MarketFooter.**
  - Columns: מקצועות, ערים (all major cities), SkillUp, משפטי.
  - The legal column adds `הצהרת נגישות` → `/accessibility`.
  - Bottom row: `AppStoreButtons`, `ThemeToggle`, logo, copyright.
- [ ] **Step 3: Legal pages.**
  - Move the three legal routes into `(market)`. `LegalPageLayout` drops its own Navbar/Footer and only renders the title and content in the 760px reading column, using v2 typography.
  - Check that the URLs `/privacy`, `/terms`, `/policy` still resolve and their metadata is unchanged.
- [ ] **Step 4: Accessibility statement.**
  - Create `/accessibility` with sections per §8.10, contact `CONTACT_EMAIL` and an update date of 2026-10.
  - Top banner: `"טיוטה, ממתינה לאישור"`, rendered only when `process.env.NEXT_PUBLIC_A11Y_APPROVED !== "true"`.
- [ ] **Step 5: SupportWidget.**
  - The button reads a CSS variable `--sticky-bar-h` (default `0px`) and sits at `bottom: calc(16px + var(--sticky-bar-h) + env(safe-area-inset-bottom))`.
  - `StickyBookingRail` sets `--sticky-bar-h: 76px` on `<body>` while mounted below `lg` (Task 7).
  - Restyle the widget with tokens: `bg-surface`, `border-line`.
- [ ] **Step 6: GatedLink.** Replace `alert` with an inline `role="status"` popover anchored to the button that closes on outside click or Escape.
- [ ] **Step 7: Delete the unused files** listed above, after the grep check.
- [ ] **Step 8:** Run `npm run build && npm run lint`. Expected: success, no missing imports.
- [ ] **Step 9:** In the browser, check that `/terms` shows the new nav and footer and that `/accessibility` renders. Check the theme toggle in the footer: switching updates `data-theme` immediately and persists after reload.
- [ ] **Step 10:** Commit: `feat(shell): v2 nav/footer, legal pages in market shell, a11y statement, remove legacy UI`

### Task 6: Home page

**Files:**
- Create: `src/lib/home-picks.ts`, `src/lib/data/home.ts`, `src/components/home/HeroWall.tsx`, `GoalTiles.tsx`, `HowItWorks.tsx`, `WhatWeCheck.tsx`, `StudentQuotes.tsx`, `ForTeachersPanel.tsx`
- Modify: `src/app/(market)/page.tsx`, `src/components/market/SearchPill.tsx`
- Test: `src/lib/__tests__/home-picks.test.ts`

**Interfaces:**
- Consumes: `getNextSlots`, `TeacherCard`, `TeacherRail`.
- Produces:
  - `pickWallTeachers(teachers: TeacherCard[], nextSlots: Record<string, AvailabilitySlot>): TeacherCard[]`. Filters `is_verified && avatar_url && review_count >= 1`. Sorts teachers with a slot first, then by `rating_avg` descending, then `review_count` descending. Returns exactly 4, or `[]` if fewer than 4 qualify.
  - `pickQuotes(input: { teacher: TeacherCard; reviews: PublicReview[] }[]): { text: string; reviewer: string; teacherName: string; subject: string | null }[]`
    - Keeps `rating === 5` with text length 40–220.
    - At most one quote per teacher, at most 3 total. Returns `[]` if fewer than 3.
    - The reviewer name `"תלמיד/ה"` (or empty) becomes `"תלמיד ב-SkillUp"`.
  - `getHomeData(): Promise<{ categories; stats: { teachers: number; categories: number }; wall: TeacherCard[]; available: TeacherCard[]; featured: TeacherCard[]; nextSlots; quotes; goals: GoalTile[] }>`
    - `stats.teachers` = `searchTeachers({limit:1}).total`.
    - `available` = featured/newest teachers that have a next slot (rail shown only if ≥ 4, else `featured`).
    - `quotes` from `getTeacherReviews` for the top 8 rated teachers, in parallel.
  - `type GoalTile = { label: string; href: string }`. Labels and lookups, resolved by `name_he` from `getCategories()`/subjects at runtime, falling back to `/search`:
    - `בגרות` → category `מבחנים והכנה`
    - `פסיכומטרי` → subject `פסיכומטרי`
    - `לשפר ציון` → category `מתמטיקה ומדעים`
    - `ללמוד משהו חדש` → category `פנאי וכישורי חיים`
    - `למבוגרים` → `searchHref({ query: "מבוגרים" })`

- [ ] **Step 1: Write the failing tests:**
  - `pickWallTeachers` with 6 eligible teachers, 2 of them with slots → those 2 are first and the length is 4.
  - With 3 eligible → `[]`.
  - A teacher with no avatar is excluded.
  - `pickQuotes` drops 4-star reviews.
  - `pickQuotes` returns at most one quote per teacher.
  - The `"תלמיד/ה"` reviewer is mapped.
  - Fewer than 3 → `[]`.
- [ ] **Step 2:** Run `npm test -- home-picks`. Expected: FAIL. Then implement and run again. Expected: PASS.
- [ ] **Step 3: Page sections**, in order per §8.3. Keep `revalidate = 1800`, the metadata and the FAQ data.
  1. `HeroWall`: H1 `ללמוד עם הטובים` + `<span class="text-spark">באמת.</span>` in `font-ed` 900 `clamp(36px,5vw,56px)`.
     - Sub: `מורים שבדקנו, מחירים ברורים וזמינות אמיתית. קובעים ישירות מול המורה.`
     - Then `SearchPill`, then the proof line `"{stats.teachers} מורים · {stats.categories} תחומים · כל הארץ"`.
     - On desktop the wall is a 2×2 grid of `variant="wall"`, with the second column offset by `translate-y-[18px]`. On mobile it becomes a horizontal rail. With an empty wall, use a centered single column.
  2. `GoalTiles`: title `מה המטרה?`.
  3. `TeacherRail`: title `יש להם מקום השבוע` (or `מורים מובילים ב-SkillUp`), `minCount` 4. Then `RecentlyViewedRail`.
  4. `HowItWorks`, 3 steps:
     - `מוצאים מורה`: `מחפשים לפי מקצוע ועיר, ומשווים פרופילים, ביקורות ומחירים.`
     - `קובעים מועד`: `שולחים בקשה למורה ביומן שלו. התשלום והביטול נקבעים ישירות מולו, SkillUp לא גובה מכם כלום.`
     - `לומדים`: `נפגשים אונליין או פנים אל פנים, וממשיכים בצ׳אט ישיר.`
  5. `WhatWeCheck`: title `מה אנחנו בודקים`. Three items:
     - `פרופיל מאומת`: `הצוות שלנו עובר על פרופילים ומסמן את אלה שאומתו בווי ליד השם.`
     - `ביקורות אמיתיות`: `רק מי שלמד אצל המורה דרך SkillUp יכול לכתוב ביקורת.`
     - `קשר ישיר`: `מדברים עם המורה עצמו, בלי מתווכים באמצע.`
  6. `StudentQuotes`: title `מה תלמידים מספרים`. The quote is in `font-ed` 700, 22px, followed by `{reviewer} · על {teacherName}{subject ? `, ${subject}` : ""}`.
  7. `ForTeachersPanel`: light panel `bg-action-soft`. H2 `אתם מלמדים. אנחנו דואגים לכל השאר.`, sub `פרופיל אחד באתר ובאפליקציה, יומן, צ׳אט עם תלמידים והתראות בזמן אמת.`, primary link `פתיחת פרופיל מורה` → `/signup?role=teacher` (guests only), secondary `עוד למורים` → `/for-tutors`. After it, the existing FAQ restyled.
- [ ] **Step 4: Remove** the categories grid, app CTA band, cities band and old For-Tutors panel from the home page. In `SearchPill`: remove `orb-glow`, use `bg-action` for the orb, use tokens for the dropdown.
- [ ] **Step 5:** Run `npm test && npm run build`. Expected: PASS.
- [ ] **Step 6:** In the browser at 1440px and 375px, light and dark, check:
  - The hero wall shows 4 teachers with photos (or falls back cleanly with dev data).
  - No large dark surface in light mode.
  - One indigo primary action per viewport.
  - Each goal tile leads to a non-empty results page in dev.
- [ ] **Step 7:** Commit: `feat(home): teachers-as-heroes home page`

### Task 7: Teacher profile

**Files:**
- Modify: `src/app/(market)/tutors/[id]/page.tsx`, `src/components/market/StickyBookingRail.tsx`, `src/components/market/ReviewsSection.tsx`
- Create: `src/components/market/AvailabilityPreview.tsx`
- Test: `src/lib/__tests__/booking.test.ts` (`bookHref` only)

**Interfaces:**
- Consumes: `GatedLink` (Task 5), `VerifiedMark`, `Avatar`, `TeacherRail` (Task 4), `getNextSlots`.
- Produces: `bookHref(teacherId: string, slotId?: string): string` in `src/lib/booking.ts` → `/tutors/{id}/book` or `/tutors/{id}/book?slot={slotId}`.

- [ ] **Step 1: Write the failing tests:**
  - `bookHref("t1") === "/tutors/t1/book"`
  - `bookHref("t1","s 2") === "/tutors/t1/book?slot=s%202"`
- [ ] **Step 2:** Run `npm test -- booking`. Expected: FAIL. Implement it, then run again. Expected: PASS.
- [ ] **Step 3: Header.**
  - Below `md`: 72px rounded avatar beside the name, `VerifiedMark`, rating, city, modes. No cover image.
  - From `md` up: cover at `h-40`, then the current header layout restyled.
- [ ] **Step 4: Content order:** header → `AvailabilityPreview` → video → `על {name}` → subjects → education/background → reviews → similar rail (with `nextSlots`).
- [ ] **Step 5: AvailabilityPreview.**
  - Up to 4 days, each time a `GatedLink` to `bookHref(id, slot.id)` styled as a 44px pill.
  - A `לכל המועדים` link to `bookHref(id)`.
  - Heading `זמינות קרובה`. Not rendered when there are no slots.
- [ ] **Step 6: StickyBookingRail.**
  - Primary label `קביעת שיעור`. The trust line is the verbatim transparency line from Global Constraints.
  - Mobile bar: sets `document.body.style.setProperty("--sticky-bar-h","76px")` on mount and clears it on unmount.
- [ ] **Step 7: ReviewsSection.**
  - Big average in `font-ed` 900. Star `#F5A623`. Distribution bars in `--c-ink`.
  - Reviewer `"תלמיד/ה"` → `"תלמיד ב-SkillUp"` (reuse the mapping helper exported from `home-picks.ts` as `displayReviewerName(name: string): string`).
- [ ] **Step 8:** Run `npm run build`, then check in the browser at 375px and 1440px:
  - The name is visible in the first viewport on mobile.
  - A slot click as a guest goes to `/login?next=%2Ftutors%2F…%2Fbook%3Fslot%3D…`.
  - The support button sits above the bottom bar.
  - A teacher account gets the inline message (Review Focus 5).
- [ ] **Step 9:** Commit: `feat(profile): compact header, clickable availability, v2 rail`

### Task 8: Booking flow

**Files:**
- Modify: `src/app/(market)/tutors/[id]/book/page.tsx`, `src/components/booking/BookingWizard.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/auth/SignupForm.tsx`, `src/components/auth/GoogleButton.tsx`, `src/app/auth/callback/route.ts`
- Create: `src/lib/safe-next.ts`, `src/lib/ics.ts`, `src/components/booking/BookingSuccess.tsx`
- Modify: `src/lib/booking.ts`
- Test: `src/lib/__tests__/booking.test.ts`, `safe-next.test.ts`, `ics.test.ts`

**Interfaces:**
- Consumes: `bookHref` (Task 7).
- Produces:
  - `safeNextPath(raw: string | null | undefined): string`. Returns `raw` only if it starts with `/`, does not start with `//` or `/\`, and has no `:` before the first `/`. Otherwise `"/"`. Used by `LoginForm`, `SignupForm`, `GoogleButton`, the auth callback, and the book page redirect.
  - `resolvePreselectedSlot(slots: AvailabilitySlot[], slotId: string | undefined): { slot: AvailabilitySlot | null; stale: boolean }`. `stale` is true when `slotId` is given but not found among the open future slots.
  - `submitLabel(teacherName: string, count: number): string`: count 1 → `"שליחת בקשה ל{name}"`, count n > 1 → `"שליחת {n} בקשות ל{name}"`.
  - `slotFitsMode(slot: AvailabilitySlot, mode: LessonMode | null): boolean`: true if `mode` is null, `allowed_modes` is empty or null, or it includes `mode`.
  - `buildIcs(e: { uid: string; title: string; startIso: string; endIso: string; description?: string }): string`: VCALENDAR with one VEVENT, `DTSTART`/`DTEND` in UTC `YYYYMMDDTHHMMSSZ`, CRLF line endings, text escaped (`,` `;` `\n`).
  - `googleCalendarUrl(e: same): string`: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=START/END&details=…`

- [ ] **Step 1: Write the failing tests:**
  - `safeNextPath("/tutors/a/book?slot=1")` returns the same string.
  - `safeNextPath("//evil.com")`, `"https://evil.com"`, `"javascript:alert(1)"`, `"/\\evil.com"`, `null` → `"/"`.
  - `resolvePreselectedSlot(slots, "missing")` → `{slot:null, stale:true}`.
  - `resolvePreselectedSlot(slots, undefined)` → `{slot:null, stale:false}`.
  - `resolvePreselectedSlot(slots, "s1")` → `{slot: s1, stale:false}`.
  - `submitLabel("רותם",1) === "שליחת בקשה לרותם"`, `submitLabel("רותם",2) === "שליחת 2 בקשות לרותם"`.
  - `slotFitsMode({allowed_modes:["online"]}, "student_home") === false`, `slotFitsMode({allowed_modes:null}, "online") === true`.
  - `buildIcs({...start "2026-10-21T14:00:00Z", end "2026-10-21T15:00:00Z"})` contains `DTSTART:20261021T140000Z` and `\r\n`, and escapes a comma in the title.
  - `googleCalendarUrl` contains `dates=20261021T140000Z/20261021T150000Z`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL. Implement the functions in `safe-next.ts`, `booking.ts` and `ics.ts`, then run again. Expected: PASS.
- [ ] **Step 3: Book page.**
  - Read `searchParams.slot`. The login redirect uses the full path including `?slot=`.
  - Pass `preselectedSlotId` to the wizard.
  - Apply `safeNextPath` everywhere `next` is consumed (login, signup, Google, callback).
- [ ] **Step 4: Wizard steps and behavior** (`STEPS = ["מועד", "פרטים", "סיכום"]`):
  - **Step 1, מועד:** preselect from `resolvePreselectedSlot`. If `stale`, show the notice `המועד שבחרתם כבר לא פנוי, בחרו מועד אחר`. Helper text: `אפשר לבחור עד 3 מועדים, כל אחד נשלח כבקשה נפרדת`. Empty state: `היומן של {name} מלא כרגע. שלחו הודעה ותתאמו מועד ישירות.`
  - **Step 2, פרטים:** subject, mode with price, address, level. If a chosen slot fails `slotFitsMode`, mark it and show `המועד {time} לא זמין ל{mode}. חזרו לבחור מועד אחר.` with a back button; continue is disabled.
  - **Step 3, סיכום:**
    - Remove the credits UI and the "לתשלום" row, and send `p_credits_to_apply: 0`. Keep `p_selected_payment_method` as today.
    - Remove the terms checkbox. Show the transparency line (with the teacher's name) and `בשליחת הבקשה אתם מאשרים את <Link href="/terms">תנאי השימוש</Link>.`
    - The submit button uses `submitLabel`.
- [ ] **Step 5: BookingSuccess.**
  - Title: `השיעור נקבע` if any booking is confirmed, else `הבקשה אצל {name}`.
  - Three-step timeline: `נשלח` → `{name} מאשר את הבקשה` → `נעדכן אתכם כאן ובאזור השיעורים שלי`.
  - Buttons: `הוספה ליומן`, which downloads `buildIcs(...)` as a `blob:` `.ics` for the first slot, with a secondary link `Google Calendar` (`googleCalendarUrl`); `לשיעורים שלי` (primary); `שליחת הודעה ל{name}`.
  - Partial failure note: `{n} מהמועדים לא נשלחו, כנראה נתפסו בינתיים.`
- [ ] **Step 6:** Run `npm test && npm run build`. Expected: PASS.
- [ ] **Step 7:** In the browser, with a dev student account:
  - Click a profile slot as a guest, log in, and land on the wizard with the slot preselected.
  - Open `?slot=bogus` and see the stale notice.
  - Submit one request against dev. Expected: the success screen; the `.ics` downloads.
- [ ] **Step 8:** Commit: `feat(booking): time-first wizard, transparency copy, success screen`

### Task 9: Search, city, category, saved

**Files:** Modify `src/app/(market)/search/page.tsx`, `src/components/search/ResultsGrid.tsx`, `FilterPanel.tsx`, `SearchToolbar.tsx`, `ActiveFilters.tsx`, `src/app/(market)/cities/[slug]/page.tsx`, `categories/[slug]/page.tsx`, `saved/page.tsx`.

**Interfaces:** Consumes `getNextSlots`, `fetchNextSlots`, `TeacherCard variant="auto"`.

- [ ] **Step 1: Search page.** Fetch `getNextSlots(initial.items.map(t=>t.id))` server-side and pass it to `ResultsGrid`. `loadMore` calls `fetchNextSlots(supabase, newIds)` and merges the result.
- [ ] **Step 2: Grid.** `ResultsGrid` renders `variant="auto"`: one column below `md`, 3 columns from `md`, 4 from `xl`.
- [ ] **Step 3: Availability in search is display-only** (my call per §11: marking, not a filter). Restyle `FilterPanel`, `SearchToolbar`, `ActiveFilters` and `BottomSheet` with tokens. Chips selected → `bg-ink text-surface`.
- [ ] **Step 4: Empty state:** title `לא מצאנו מורים שמתאימים לחיפוש הזה`, helper `נסו להסיר חלק מהסינונים או לחפש מקצוע קרוב.`, and the existing suggestion chips.
- [ ] **Step 5: Other listing pages.** Cities, categories and saved pass `nextSlots` to their grids/rails. Page H1s use `font-ed` 700.
- [ ] **Step 6:** Run `npm run build`. Then check `/search` in the browser at 375px (row list) and 1440px (grid), and check a city page.
- [ ] **Step 7:** Commit: `feat(search): v2 results with availability`

### Task 10: Account and auth surfaces

**Files:** Modify `src/app/(market)/bookings/page.tsx`, `messages/page.tsx`, `messages/[id]/page.tsx`, `src/components/chat/ChatThread.tsx`, `src/components/account/AccountForm.tsx`, `ScheduleManager.tsx`, `src/app/(market)/account/*`, `src/components/auth/AuthShell.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `src/lib/auth/ensure-role-row.ts`, `src/lib/data/session.ts`, `src/lib/data/messaging.ts`, `src/components/auth/AuthProvider.tsx`, `src/components/market/MarketNav.tsx`.

- [ ] **Step 1: Booking status labels and tones:**
  - `pending` → `ממתין לאישור המורה` (warn)
  - `awaiting_payment` → `ממתין לתיאום עם המורה` (warn)
  - `confirmed` → `מאושר` (ok)
  - `completed` → `הסתיים` (ink)
  - `cancelled` and `refunded` → `בוטל` (danger)
- [ ] **Step 2: Replace slash-gendered fallbacks:**
  - `תלמיד/ה` → `לומד`
  - `משתמש/ת` → `משתמש SkillUp`
  - `מקליד/ה...` → `מקלידים...`
  - `חדש/ה` → neutral phrasing per context
  - Signup role options → `אני רוצה ללמוד` / `אני רוצה ללמד`
- [ ] **Step 3: Login/Signup.**
  - Google button first, labeled `המשך עם Google`, then the divider `או עם אימייל`, then the form.
  - `AuthShell` restyled: surface card on canvas, `font-ed` title.
- [ ] **Step 4: Restyle** messages, chat, account and schedule with tokens. Empty states keep the current copy minus exclamation marks.
- [ ] **Step 5:** Run `npm run build`, then click through login, signup (role toggle), `/bookings`, `/messages`, `/account` with a dev account.
- [ ] **Step 6:** Commit: `feat(account): v2 account and auth surfaces, neutral copy`

### Task 11: Remaining pages, alias removal, guard test

**Files:**
- Modify: `src/app/(market)/how-it-works/page.tsx`, `for-tutors/page.tsx`, `faq/page.tsx`, `articles/**`, `forgot-password`, `reset-password`, `src/app/verify-email`, `unsubscribe`, `settings/notifications`, `lesson/[id]`, `chat/[id]`, `teacher/[id]`, `dev/teacher/[id]`, `src/components/layout/AppLinkShell.tsx`, `TeacherDeepLinkContent.tsx`, `src/app/globals.css`
- Test: `src/lib/__tests__/brand-guards.test.ts`

- [ ] **Step 1: Write the guard test.** It walks `src/**/*.{ts,tsx,css}`, excluding `src/lib/legal-content.ts`, `src/lib/__tests__/**` and `src/app/_og/**`, and asserts there are zero matches for:
  - `/[א-ת]+\/(ה|ת|ית)(?![א-ת])/` (gendered slash in UI strings)
  - `/--mk-|--panel-|\bdark-\d|\bpaper-\d|\bmode-(online|teacher|student)\b/`
  - `/components\/landing|components\/layout\/(Navbar|Footer)|ui\/Button/`
  - `/Heebo|JetBrains|font-heebo|font-mono-lc/` (outside `app/opengraph-image.tsx`)
  - `/amber-400|#F59E0B|#FBBF24/i`
  - `/title-gradient|orb-glow|alert\(/`
  - `/rounded-(lg|xl|2xl|3xl|md)\b|rounded-\[(?!var\()/` (only `rounded-full` and the token radii)
- [ ] **Step 2:** Run `npm test -- brand-guards`. Expected: FAIL, with the remaining offenders listed.
- [ ] **Step 3: Migrate every remaining page** to tokens and v2 type, applying the §9 glossary:
  - how-it-works: the 3 steps from Task 6 plus the transparency line.
  - for-tutors: keep the no-commission benefit copy (it matches §1) and drop exclamation marks.
  - Remove all `--mk-*` / `--panel-*` / `brand-*` aliases and legacy tokens from `globals.css`.
  - Replace `rounded-*` with `rounded-[var(--r-sm)]`, `rounded-[var(--r-md)]` or `rounded-full`.
  - Every lucide icon uses `strokeWidth={1.75}` at sizes 16/20/24.
- [ ] **Step 4:** Run `npm test && npm run lint && npm run build`. Expected: all PASS.
- [ ] **Step 5: Final browser pass** at 375px and 1440px, light and dark, on every page listed in §12. Check:
  - One indigo primary per screen.
  - Text at least 14px.
  - No horizontal scroll.
  - Focus rings visible.
  - Reduced motion respected (toggle in devtools).
- [ ] **Step 6:** Commit: `feat(brand): migrate remaining pages, remove legacy tokens, add guard test`
