import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";
import { JSON_LD_BLOCKS } from "@/lib/structured-data";
import { themeInitScript } from "@/lib/theme";

const rubik = Rubik({
  variable: "--font-family-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "SkillUp",
  category: "education",
  title:
    "SkillUp | האפליקציה הישראלית לשיעורים פרטיים. 9 תחומים, כל הארץ, בעברית",
  description:
    "SkillUp. האפליקציה הישראלית למציאת מורה פרטי ב-9 תחומים: מתמטיקה ומדעים, שפות, בגרויות ופסיכומטרי, ספורט, אומנות, תכנות, ופנאי ומיומנויות חיים (בישול, נהיגה, מוזיקה). שלוש דרכי לימוד: אונליין, אצל המורה, או אצלכם. מורים מאומתים, זמינות אמיתית, קשר ישיר בלי מתווכים. עברית מלאה, RTL.",
  keywords: [
    // Core
    "מורה פרטי",
    "שיעורים פרטיים",
    "מורה פרטי אונליין",
    "אפליקציית מורים פרטיים",
    "SkillUp",
    // Math & Science
    "מורה פרטי למתמטיקה",
    "מורה פרטי לפיזיקה",
    "מורה פרטי לכימיה",
    "מורה פרטי לביולוגיה",
    // Languages & Hebrew
    "מורה פרטי לאנגלית",
    "מורה פרטי לצרפתית",
    "מורה פרטי לספרדית",
    "מורה פרטי לעברית",
    "מורה פרטי ללשון",
    // Exam prep
    "הכנה לבגרות",
    "פסיכומטרי",
    "הכנה לפסיכומטרי",
    "מורה פרטי ל-SAT",
    // Tech
    "מורה פרטי לתכנות",
    "מורה פרטי ל-Python",
    "מורה פרטי למדעי המחשב",
    // Arts & life skills (the differentiator)
    "שיעורי בישול",
    "שיעורי נהיגה",
    "שיעורי גיטרה",
    "מורה פרטי לפסנתר",
    "שיעורי פיתוח קול",
    "שיעורי ציור",
    "מורה פרטי לכושר",
    "שיעורי ריקוד",
    // GEO: cities
    "מורה פרטי בתל אביב",
    "מורה פרטי בירושלים",
    "מורה פרטי בחיפה",
    "מורה פרטי בבאר שבע",
    "מורה פרטי ברמת גן",
    "מורה פרטי בפתח תקווה",
    "מורה פרטי בנתניה",
    "מורה פרטי בחולון",
    "מורה פרטי באשדוד",
    "מורה פרטי ברעננה",
    "מורה פרטי אונליין בעברית",
    // English (GEO: English searches + AI assistants)
    "private tutor Israel",
    "private tutors in Israel",
    "tutoring app Israel",
    "find a tutor in Israel",
    "math tutor Israel",
    "English tutor Israel",
    "Hebrew tutor",
    "bagrut tutor",
    "psychometric prep Israel",
    "private lessons Israel",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  // og:image / twitter:image are generated at build time by src/app/opengraph-image.tsx
  openGraph: {
    title: "SkillUp. האפליקציה הישראלית לשיעורים פרטיים",
    description:
      "9 תחומים, 3 דרכי לימוד, כל הארץ, בעברית. מורים מאומתים, קשר ישיר בלי מתווכים.",
    url: "/",
    type: "website",
    locale: "he_IL",
    siteName: "SkillUp",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillUp. האפליקציה הישראלית לשיעורים פרטיים",
    description:
      "9 תחומים, 3 דרכי לימוד, כל הארץ, בעברית. מורים מאומתים, קשר ישיר בלי מתווכים.",
  },
  itunes: {
    appId: "6762197788",
  },
  // GEO targeting: Israel nationwide. ICBM is the approximate country centroid.
  other: {
    "geo.region": "IL",
    "geo.placename": "Israel",
    ICBM: "31.0461,34.8516",
  },
};

// JSON-LD payloads are built from trusted in-repo constants only (no user input).
// The </script replacement prevents script-context breakout per OWASP JSON-in-HTML guidance.
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={rubik.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {JSON_LD_BLOCKS.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }}
          />
        ))}
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
