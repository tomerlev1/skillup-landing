import {
  ShieldVerifiedIcon,
  TrustCheckIcon,
  ModalityIcon,
} from "@/components/icons/CustomIcons";

const BADGES = [
  { Icon: TrustCheckIcon, label: "0% עמלה. אף פעם." },
  { Icon: ShieldVerifiedIcon, label: "מורים עם תעודת זהות מאומתת" },
  { Icon: ModalityIcon, label: "אונליין · אצל המורה · אצלכם" },
  { Icon: TrustCheckIcon, label: "עברית מלאה · RTL" },
];

export default function TrustBarSection() {
  return (
    <section className="w-full border-y border-dark-200 px-6 py-6 md:px-16">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2.5 md:gap-3">
        {BADGES.map(({ Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-dark-700 backdrop-blur-sm"
          >
            <Icon className="h-4 w-4 text-brand-600" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
