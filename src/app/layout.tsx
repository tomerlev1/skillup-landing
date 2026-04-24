import type { Metadata } from "next";
import { Rubik, Heebo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";
import { JSON_LD_BLOCKS } from "@/lib/structured-data";

const rubik = Rubik({
  variable: "--font-family-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const heebo = Heebo({
  variable: "--font-family-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-family-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:
    "SkillUp | האפליקציה הישראלית לשיעורים פרטיים. 9 תחומים, כל הארץ, בעברית",
  description:
    "SkillUp. האפליקציה הישראלית למציאת מורה פרטי ב-9 תחומים: מתמטיקה ומדעים, שפות, בגרויות ופסיכומטרי, ספורט, אומנות, תכנות, ופנאי ומיומנויות חיים (בישול, נהיגה, מוזיקה). שלוש דרכי לימוד: אונליין, אצל המורה, או אצלכם. עברית מלאה, RTL, מורים מאומתים, ללא עמלת תיווך לעולם. חינם בתקופת הבטא.",
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
    // Pricing/value
    "0% עמלה תמיד",
    "מורה פרטי ללא עמלות",
    "חינם בבטא",
    "אפליקציית שיעורים פרטיים חינם",
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
  openGraph: {
    title: "SkillUp. האפליקציה הישראלית לשיעורים פרטיים",
    description:
      "9 תחומים, 3 דרכי לימוד, כל הארץ, בעברית. ללא עמלת תיווך. אתם משלמים ישירות למורה.",
    url: "/",
    type: "website",
    locale: "he_IL",
    siteName: "SkillUp",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "SkillUp. האפליקציה הישראלית לשיעורים פרטיים",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillUp. האפליקציה הישראלית לשיעורים פרטיים",
    description: "9 תחומים, 3 דרכי לימוד, כל הארץ, בעברית. ללא עמלת תיווך.",
    images: ["/images/og-cover.png"],
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
    <html lang="he" dir="rtl">
      <head>
        {JSON_LD_BLOCKS.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }}
          />
        ))}
      </head>
      <body className={`${rubik.variable} ${heebo.variable} ${jetbrainsMono.variable} font-[family-name:var(--font-family-rubik)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
