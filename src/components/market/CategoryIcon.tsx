import {
  BookOpen,
  Calculator,
  Code,
  Dumbbell,
  Globe,
  GraduationCap,
  Heart,
  Languages,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// categories.icon_name in the DB already holds Lucide component names
// (Calculator, Languages, BookOpen, ...). Unknown names fall back safely.
const ICONS: Record<string, LucideIcon> = {
  Calculator,
  Languages,
  BookOpen,
  GraduationCap,
  Globe,
  Dumbbell,
  Palette,
  Code,
  Heart,
};

interface CategoryIconProps {
  iconName: string | null;
  size?: number;
  className?: string;
}

export default function CategoryIcon({
  iconName,
  size = 20,
  className = "",
}: CategoryIconProps) {
  const Icon = (iconName && ICONS[iconName]) || Sparkles;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
