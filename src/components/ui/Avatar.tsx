import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
  name: string;
  size: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

// Photo avatar with an initials fallback on the brand tint (accent-budget
// exception: tiny identity moments may use the indigo-50 tint).
export default function Avatar({ src, name, size, className = "" }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}
