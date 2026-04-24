interface EyebrowProps {
  n: string; // e.g. "01 / QUICK ANSWER"
  children: React.ReactNode;
  align?: "start" | "center";
}

export default function Eyebrow({ n, children, align = "start" }: EyebrowProps) {
  return (
    <div
      className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}
    >
      <span className="mono-sm text-[var(--fg-muted)]" dir="ltr">
        {n}
      </span>
      <span className="h-px w-8 bg-[var(--rule-strong)]" aria-hidden="true" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}
