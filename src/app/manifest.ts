import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillUp | שיעורים פרטיים בישראל",
    short_name: "SkillUp",
    description:
      "האפליקציה הישראלית למציאת מורים פרטיים מאומתים ולקביעת שיעורים פרטיים בכל הארץ.",
    lang: "he",
    dir: "rtl",
    start_url: "/",
    display: "browser",
    theme_color: "#4F46E5",
    background_color: "#F8F9FB",
    icons: [
      {
        src: "/images/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
