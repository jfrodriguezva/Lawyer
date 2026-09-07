export default function StatTile({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-brand-line bg-brand-ink2 px-6 py-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-brand-cream">
        {value}
      </p>
    </div>
  );
}
