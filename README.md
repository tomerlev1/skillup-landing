# SkillUp — Web

אתר המרקטפלייס של SkillUp: חיפוש מורים פרטיים, פרופיל מורה, קביעת שיעור, הודעות ואזור אישי.
Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase. עברית, RTL.

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # למלא את מפתחות Supabase של סביבת ה-DEV
npm run dev                  # http://localhost:3000
```

| פקודה | מה עושה |
| --- | --- |
| `npm run dev` | שרת פיתוח |
| `npm run build` / `npm start` | בנייה והרצה כמו בפרודקשן |
| `npm test` | בדיקות (vitest), כולל בדיקות שמירה על המותג |
| `npm run lint` | ESLint |

## מבנה

- `src/app/(market)` — כל דפי האתר (בית, חיפוש, מורה, הזמנה, הודעות, פרופיל, מאמרים, משפטי).
- `src/app/{chat,lesson,teacher,dev/teacher,verify-email,settings,unsubscribe}` — דפי נחיתה ל-Universal Links של האפליקציה. **לא למחוק**: הם רשומים ב-`public/.well-known/apple-app-site-association`.
- `src/components` — רכיבי UI לפי תחום (`market`, `search`, `account`, `chat`, `booking`, `home`, `ui`).
- `src/lib` — לוגיקה, גישה לנתונים (`lib/data`) ולקוחות Supabase.
- `src/app/globals.css` — טוקנים של המותג (צבעים, רדיוסים, צללים, מצב כהה).
- `docs/brand` — מסמך המיתוג. `docs/superpowers` — אפיון ותוכנית העיצוב מחדש.

## כללי מותג

רדיוסים רק דרך משתני הרדיוס (`--r-sm`, `--r-md`, `--r-lg`, `--r-pill`), צבעים רק מהטוקנים. `src/lib/__tests__/brand-guards.test.ts` נכשל אם הכללים נשברים.
