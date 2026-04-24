import { CATEGORIES } from "@/lib/constants";

// Flattens all subjects across all categories into one long list, rendered twice
// and animated 0 → -50% for a seamless LTR-wrapped loop (Hebrew words still render
// right-to-left internally via the Unicode bidi algorithm).
export default function KineticTickerSection() {
  const words = CATEGORIES.flatMap((c) => [...c.subjects]);
  const copies = [...words, ...words];

  return (
    <section className="overflow-hidden border-y-[1.5px] border-[var(--color-ink-900)] bg-[var(--bg)] py-6">
      <div className="kinetic">
        <div className="kinetic__track">
          {copies.map((w, i) => (
            <span key={i} className="kinetic__item">
              <span className={i % 2 ? "kinetic--outline" : ""}>{w}</span>
              <span
                className="kinetic__dot"
                style={{
                  background:
                    i % 3 === 0
                      ? "var(--color-accent-500)"
                      : "var(--accent-grad-a)",
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
