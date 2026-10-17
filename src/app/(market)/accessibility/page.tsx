import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "הצהרת נגישות - SkillUp",
  description: "הצהרת הנגישות של אתר SkillUp: מה עשינו, מה עדיין חסר ואיך אפשר לפנות אלינו.",
  alternates: { canonical: "/accessibility" },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "commitment",
    title: "המחויבות שלנו",
    body: (
      <p>
        ב-SkillUp מאמינים שכולם צריכים להיות מסוגלים למצוא מורה ולקבוע שיעור בלי
        חסמים. אנחנו עובדים כדי שהאתר יהיה נגיש לאנשים עם מוגבלויות, ושיפור הנגישות הוא חלק
        מהפיתוח השוטף שלנו.
      </p>
    ),
  },
  {
    id: "level",
    title: "רמת ההתאמה",
    body: (
      <p>
        אנחנו מכוונים לעמוד בתקן הישראלי ת&quot;י 5568 ובהנחיות WCAG 2.1 ברמה AA, בהתאם
        לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות). עדיין לא
        נערכה בדיקה של גורם חיצוני מוסמך.
      </p>
    ),
  },
  {
    id: "done",
    title: "מה עשינו",
    body: (
      <ul>
        <li>האתר בנוי בעברית מימין לשמאל, עם הגדרת שפה וכיוון בכל עמוד.</li>
        <li>אפשר לנווט בכל האתר באמצעות מקלדת בלבד, עם סימון ברור של האלמנט הפעיל.</li>
        <li>כפתורים וקישורים גדולים מספיק למגע, לפחות 44 על 44 פיקסלים.</li>
        <li>צבעי הטקסט והרקע נבחרו ליחס ניגודיות העומד בדרישות AA, גם במצב התצוגה הכהה.</li>
        <li>אפשר לבחור בין מצב תצוגה בהיר, כהה או לפי המכשיר, מתחתית כל עמוד.</li>
        <li>לתמונות משמעותיות יש טקסט חלופי, ולרכיבים אינטראקטיביים יש שמות נגישים.</li>
        <li>האתר מכבד את ההגדרה של הפחתת תנועה במכשיר שלכם.</li>
        <li>טפסים כוללים תוויות והודעות שגיאה שמסבירות מה לתקן.</li>
      </ul>
    ),
  },
  {
    id: "limits",
    title: "מגבלות ידועות",
    body: (
      <>
        <p>למרות המאמץ, ייתכן שחלקים באתר עדיין אינם נגישים במלואם:</p>
        <ul>
          <li>תמונות פרופיל שמורים מעלים בעצמם עשויות להגיע בלי תיאור מפורט.</li>
          <li>חלק מהתוכן שמורים כותבים בפרופילים שלהם לא עבר בדיקת נגישות.</li>
          <li>יומן הזמינות ובחירת המועדים נבדקו בעיקר עם מקלדת, ופחות עם קוראי מסך שונים.</li>
          <li>מסמכים משפטיים ארוכים עלולים להיות קשים יותר לקריאה בקורא מסך.</li>
        </ul>
        <p>אנחנו עובדים על תיקון הנקודות האלה.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "דרכי פנייה",
    body: (
      <>
        <p>
          נתקלתם בקושי או יש לכם הצעה לשיפור? כתבו לנו ונחזור אליכם. כדאי לציין את כתובת
          העמוד, את תיאור הבעיה ואת הדפדפן או המכשיר שבהם השתמשתם.
        </p>
        <p>
          אימייל:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="ltr-isolate">
            {CONTACT_EMAIL}
          </a>
        </p>
      </>
    ),
  },
  {
    id: "updated",
    title: "תאריך עדכון",
    body: <p>הצהרה זו עודכנה לאחרונה באוקטובר 2026.</p>,
  },
];

// Draft until the owner approves the wording: set NEXT_PUBLIC_A11Y_APPROVED=true
// to remove the banner.
export default function AccessibilityPage() {
  const approved = process.env.NEXT_PUBLIC_A11Y_APPROVED === "true";

  return (
    <div className="bg-surface">
      {!approved && (
        <div
          role="note"
          className="border-b border-line bg-action-soft px-4 py-3 text-center text-sm font-medium text-ink"
        >
          טיוטה, ממתינה לאישור
        </div>
      )}
      <article className="mx-auto max-w-[760px] px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10">
          <h1 className="font-ed text-[32px] font-black leading-tight text-ink sm:text-[40px]">
            הצהרת נגישות
          </h1>
          <p className="mt-3 text-sm text-ink-3">עודכן לאחרונה: אוקטובר 2026</p>
        </header>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="mb-10 scroll-mt-24">
            <h2 className="mb-3 text-xl font-semibold text-ink">{s.title}</h2>
            <div className="space-y-3 text-base leading-[1.75] text-ink-2 [&_a]:text-action [&_a]:underline [&_a]:underline-offset-2 [&_li]:mb-2 [&_ul]:list-disc [&_ul]:ps-6">
              {s.body}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
