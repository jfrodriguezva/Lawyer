"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Monogram from "@/components/Monogram";
import { IconChevronDown, IconClose, IconMenu } from "@/components/icons";
import { getFlags } from "@/lib/api";
import { AREA_EMPRESARIAL, AREA_FAMILIAR, AREA_SAT, serviciosPorArea } from "@/lib/servicios";

const TABS = [
  { href: "/?tab=procesos", label: "Procesos", tab: "procesos" },
  { href: "/?tab=quienes-somos", label: "Quiénes somos", tab: "quienes-somos" },
  { href: "/?tab=mision", label: "Misión y valores", tab: "mision" },
];

const ACCESOS = [
  { href: "/login", label: "Personal del despacho", hint: "Staff" },
  { href: "/cliente/login", label: "Portal de clientes", hint: "Cliente" },
];

export default function GuestHeader() {
  return (
    <Suspense fallback={null}>
      <GuestHeaderInner />
    </Suspense>
  );
}

function GuestHeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [accesoOpen, setAccesoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServiciosOpen, setMobileServiciosOpen] = useState(false);
  const [satHabilitado, setSatHabilitado] = useState(false);

  useEffect(() => {
    getFlags()
      .then((flags) => setSatHabilitado(flags.satHabilitado))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra todo al navegar, para que un menú no quede abierto sobre la nueva pantalla.
  // Depende también de los query params: un clic en Procesos/Quiénes somos/un
  // servicio no cambia el pathname (sigue en "/"), solo el query string, así que
  // solo mirar el pathname dejaba el menú móvil abierto y tapando el contenido.
  useEffect(() => {
    setServiciosOpen(false);
    setAccesoOpen(false);
    setMobileOpen(false);
    setMobileServiciosOpen(false);
  }, [pathname, searchParams]);

  const enHome = pathname === "/";
  const tabActual = enHome ? searchParams.get("tab") : null;
  const servicioActual = enHome ? searchParams.get("servicio") : null;
  const enServicios = pathname?.startsWith("/servicios") || (enHome && !!servicioActual);
  const enInicio = enHome && !tabActual && !servicioActual;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-brand-line bg-brand-ink/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "py-3" : "py-6"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <Monogram size={scrolled ? 32 : 40} />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-wide text-brand-cream">
              ECG ABOGADOS
            </p>
            {!scrolled && (
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-creamSoft">
                Despacho Jurídico
              </p>
            )}
          </div>
        </Link>

        {/* Navegación de escritorio, en forma de pestañas con indicador de sección activa.
            Empieza en lg (1024px): con 6 enlaces + el menú de Servicios, md (768px,
            tablets) no tiene espacio suficiente y los elementos se encimaban. */}
        <nav className="hidden items-center gap-1 lg:flex">
          <NavTab href="/" label="Inicio" active={enInicio} />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setServiciosOpen((v) => !v);
                setAccesoOpen(false);
              }}
              className={`flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                enServicios || serviciosOpen
                  ? "text-brand-gold"
                  : "text-brand-creamSoft hover:text-brand-cream"
              }`}
              aria-expanded={serviciosOpen}
            >
              Servicios
              <IconChevronDown className={`h-3 w-3 transition-transform ${serviciosOpen ? "rotate-180" : ""}`} />
            </button>

            {serviciosOpen && (
              <>
                <button
                  aria-label="Cerrar menú de servicios"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setServiciosOpen(false)}
                />
                <ServiciosMenu satHabilitado={satHabilitado} onNavigate={() => setServiciosOpen(false)} />
              </>
            )}
          </div>

          {TABS.map((tab) => (
            <NavTab key={tab.href} href={tab.href} label={tab.label} active={tabActual === tab.tab} />
          ))}

          <NavTab href="/#agenda" label="Agendar" />
        </nav>

        <div className="flex items-center gap-4">
          {/* Acceso: un solo control que distingue personal vs. clientes */}
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => {
                setAccesoOpen((v) => !v);
                setServiciosOpen(false);
              }}
              className="flex items-center gap-1.5 border border-brand-line px-3.5 py-2 text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
              aria-expanded={accesoOpen}
            >
              Acceso
              <IconChevronDown className={`h-3 w-3 transition-transform ${accesoOpen ? "rotate-180" : ""}`} />
            </button>

            {accesoOpen && (
              <>
                <button
                  aria-label="Cerrar menú de acceso"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setAccesoOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-64 border border-brand-line bg-brand-ink2 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
                  {ACCESOS.map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className="flex items-center justify-between px-4 py-3 text-sm text-brand-cream transition-colors hover:bg-brand-ink hover:text-brand-gold"
                    >
                      {a.label}
                      <span className="text-[10px] uppercase tracking-widest text-brand-creamSoft">{a.hint}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Toggle de navegación móvil */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex h-9 w-9 items-center justify-center border border-brand-line text-brand-cream transition-colors hover:border-brand-gold hover:text-brand-gold lg:hidden"
          >
            {mobileOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navegación móvil */}
      {mobileOpen && (
        <div className="border-t border-brand-line bg-brand-ink px-6 py-4 lg:hidden">
          <nav className="flex flex-col">
            <Link
              href="/"
              className={`py-3 text-sm uppercase tracking-widest ${enInicio ? "text-brand-gold" : "text-brand-cream"}`}
            >
              Inicio
            </Link>

            <button
              type="button"
              onClick={() => setMobileServiciosOpen((v) => !v)}
              className={`flex items-center justify-between py-3 text-sm uppercase tracking-widest ${
                enServicios ? "text-brand-gold" : "text-brand-cream"
              }`}
            >
              Servicios
              <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${mobileServiciosOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileServiciosOpen && <ServiciosMenuMovil satHabilitado={satHabilitado} />}

            {TABS.map((tab) => (
              <Link key={tab.href} href={tab.href} className="py-3 text-sm uppercase tracking-widest text-brand-cream">
                {tab.label}
              </Link>
            ))}
            <Link href="/#agenda" className="py-3 text-sm uppercase tracking-widest text-brand-cream">
              Agendar
            </Link>

            <div className="mt-3 flex flex-col gap-2 border-t border-brand-line pt-4">
              {ACCESOS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between border border-brand-line px-4 py-3 text-sm text-brand-creamSoft"
                >
                  {a.label}
                  <span className="text-[10px] uppercase tracking-widest">{a.hint}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavTab({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
        active ? "text-brand-gold" : "text-brand-creamSoft hover:text-brand-cream"
      }`}
    >
      {label}
    </Link>
  );
}

// Grupos del menú de Servicios: separados por módulo del sistema (Abogado / SAT /
// Comercializadora), nunca mezclados, porque cada uno corresponde a un rol y a un
// flujo de agenda distinto. SAT y Comercializadora se muestran atenuados como
// "Próximamente" cuando el módulo respectivo aún no está habilitado.
function ServiciosMenu({ satHabilitado, onNavigate }: { satHabilitado: boolean; onNavigate: () => void }) {
  const familiares = serviciosPorArea(AREA_FAMILIAR);
  const empresarial = serviciosPorArea(AREA_EMPRESARIAL);
  const sat = serviciosPorArea(AREA_SAT);

  return (
    <div className="absolute left-1/2 z-50 mt-2 w-[620px] -translate-x-1/2 border border-brand-line bg-brand-ink2 p-6 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.65)]">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <GrupoServicios titulo="Derecho familiar" servicios={familiares} onNavigate={onNavigate} />
        <GrupoServicios titulo="Fiscal y empresarial" servicios={empresarial} onNavigate={onNavigate} />
        {satHabilitado ? (
          <GrupoServicios titulo="Trámites SAT" servicios={sat} onNavigate={onNavigate} />
        ) : (
          <GrupoProximamente titulo="Trámites SAT" />
        )}
        <GrupoProximamente titulo="Comercializadora" />
      </div>
      <Link
        href="/servicios"
        onClick={onNavigate}
        className="mt-6 block border-t border-brand-line pt-4 text-center text-xs font-semibold uppercase tracking-widest text-brand-gold hover:underline"
      >
        Ver todos los servicios →
      </Link>
    </div>
  );
}

function GrupoServicios({
  titulo,
  servicios,
  onNavigate,
}: {
  titulo: string;
  servicios: ReturnType<typeof serviciosPorArea>;
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">{titulo}</p>
      <ul className="mt-3 space-y-2">
        {servicios.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/?servicio=${s.slug}`}
              onClick={onNavigate}
              className="text-sm text-brand-creamSoft transition-colors hover:text-brand-cream"
            >
              {s.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrupoProximamente({ titulo }: { titulo: string }) {
  return (
    <div className="opacity-50">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-creamSoft">{titulo}</p>
      <p className="mt-3 text-sm italic text-brand-creamSoft">Próximamente</p>
    </div>
  );
}

function ServiciosMenuMovil({ satHabilitado }: { satHabilitado: boolean }) {
  const familiares = serviciosPorArea(AREA_FAMILIAR);
  const empresarial = serviciosPorArea(AREA_EMPRESARIAL);
  const sat = serviciosPorArea(AREA_SAT);

  return (
    <div className="mb-2 flex flex-col gap-4 border-l border-brand-line pl-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Derecho familiar</p>
        {familiares.map((s) => (
          <Link key={s.slug} href={`/?servicio=${s.slug}`} className="block py-1.5 text-sm text-brand-creamSoft">
            {s.titulo}
          </Link>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Fiscal y empresarial</p>
        {empresarial.map((s) => (
          <Link key={s.slug} href={`/?servicio=${s.slug}`} className="block py-1.5 text-sm text-brand-creamSoft">
            {s.titulo}
          </Link>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Trámites SAT</p>
        {satHabilitado ? (
          sat.map((s) => (
            <Link key={s.slug} href={`/?servicio=${s.slug}`} className="block py-1.5 text-sm text-brand-creamSoft">
              {s.titulo}
            </Link>
          ))
        ) : (
          <p className="py-1.5 text-sm italic text-brand-creamSoft/70">Próximamente</p>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Comercializadora</p>
        <p className="py-1.5 text-sm italic text-brand-creamSoft/70">Próximamente</p>
      </div>
      <Link href="/servicios" className="py-1.5 text-sm font-semibold text-brand-gold">
        Ver todos →
      </Link>
    </div>
  );
}
