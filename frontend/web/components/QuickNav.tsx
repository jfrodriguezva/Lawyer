"use client";

const ITEMS = [
  { href: "#proceso", label: "El proceso" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#familiar", label: "Derecho familiar" },
  { href: "#empresarial", label: "Fiscal y empresarial" },
  { href: "/servicios/tramites-sat", label: "Trámites SAT" },
  { href: "#contacto", label: "Contacto" },
];

/**
 * Franja de navegación rápida bajo el hero: da acceso directo a las secciones
 * clave de la home sin depender solo de hacer scroll para encontrarlas.
 */
export default function QuickNav() {
  return (
    <nav
      aria-label="Navegación rápida"
      className="scrollbar-none -mx-6 mt-10 flex gap-2 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
    >
      {ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="shrink-0 border border-brand-line px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
