import type { EstatusCaso, EstatusCita } from "@/lib/api";

type Estatus = EstatusCaso | EstatusCita;

const STYLES: Record<string, string> = {
  Activo: "border-brand-gold text-brand-gold bg-brand-gold/10",
  Pendiente: "border-brand-gold text-brand-gold bg-brand-gold/10",
  Revision: "border-brand-creamSoft text-brand-creamSoft bg-brand-creamSoft/10",
  Confirmada: "border-brand-gold text-brand-gold bg-brand-gold/10",
  Cerrado: "border-brand-line text-brand-creamSoft bg-transparent",
  Cancelada: "border-brand-line text-brand-creamSoft/60 bg-transparent",
};

const LABELS: Record<string, string> = {
  Activo: "Activo",
  Revision: "En revisión",
  Cerrado: "Cerrado",
  Pendiente: "Pendiente",
  Confirmada: "Confirmada",
  Cancelada: "Cancelada",
};

export default function StatusPill({ estatus }: { estatus: Estatus }) {
  const style = STYLES[estatus] ?? "border-brand-line text-brand-creamSoft";
  const label = LABELS[estatus] ?? estatus;
  return (
    <span
      className={`inline-flex items-center rounded-none border px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest ${style}`}
    >
      {label}
    </span>
  );
}
