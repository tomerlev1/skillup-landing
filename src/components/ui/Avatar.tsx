import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
  name: string;
  size: number;
  className?: string;
}

/** First visible letter of a name ("ד״ר מיכל" → "ד"). */
export function monogram(name: string): string {
  return name.trim().match(/\p{L}/u)?.[0] ?? "";
}

// Photo avatar; without a photo, a serif monogram (spec §7.4):
// first letter, Frank Ruhl 900, --c-action on --c-action-soft.
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
      className={`font-ed inline-flex shrink-0 items-center justify-center rounded-full bg-action-soft font-black leading-none text-action ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(14, Math.round(size * 0.46)) }}
    >
      {monogram(name)}
    </span>
  );
}
