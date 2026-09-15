"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import Monogram from "@/components/Monogram";
import { IconChevronDown, IconClose, IconMenu } from "@/components/icons";
import { getFlags } from "@/lib/api";
import { AREA_EMPRESARIAL, AREA_FAMILIAR, AREA_SAT, serviciosPorArea } from "@/lib/servicios";

const TABS = [
  { href: "/?tab=quienes-somos", label: "Quiénes somos", tab: "quienes-somos" },
  { href: "/?tab=mision", label: "Misión y valores", tab: "mision" },
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
    setMobileOpen(false);
    setMobileServiciosOpen(false);
  }, [pathname, searchParams]);

  const enHome = pathname === "/";
  const tabActual = enHome ? searchParams.get("tab") : null;
  const servicioActual = enHome ? searchParams.get("servicio") : null;
  const enServicios = pathname?.startsWith("/servicios") || (enHome && !!servicioActual);
  const enInicio = enHome && !tabActual && !servicioActual;

  // "Inicio" siempre sube al principio de la página; si ya estábamos en "/" el
  // cambio de query no mueve el scroll por sí solo (el pathname no cambia).
  function irAlInicio() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // "Agendar" solo baja a la sección de agenda: nunca navega ni toca el query
  // string, porque cambiar el query dispara el efecto que resetea el panel de
  // servicios y provoca una carrera con el scroll (bug reportado por el usuario).
  function irAAgendar() {
    document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
          <NavTab href="/" label="Inicio" active={enInicio} onClick={irAlInicio} />

          <div className="relative">
            <button
              type="button"
              onClick={() => setServiciosOpen((v) => !v)}
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

          <button
            type="button"
            onClick={irAAgendar}
            className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-brand-creamSoft transition-colors hover:text-brand-cream"
          >
            Agendar
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* Acceso: un solo botón, sin elegir de antemano el tipo de cuenta.
              El sistema detecta si es personal o cliente y redirige a su portal. */}
          <Link
            href="/acceso"
            className="hidden items-center gap-1.5 border border-brand-line px-3.5 py-2 text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold lg:flex"
          >
            Acceso
          </Link>

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
              onClick={irAlInicio}
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
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                irAAgendar();
              }}
              className="py-3 text-left text-sm uppercase tracking-widest text-brand-cream"
            >
              Agendar
            </button>

            <div className="mt-3 border-t border-brand-line pt-4">
              <Link
                href="/acceso"
                className="block border border-brand-line px-4 py-3 text-center text-sm uppercase tracking-widest text-brand-creamSoft"
              >
                Acceso
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavTab({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
          <GrupoServicios
            titulo="Trámites SAT"
            icono={<ChipImagen src="/images/sat-gold.png" />}
            servicios={sat}
            onNavigate={onNavigate}
          />
        ) : (
          <GrupoProximamente titulo="Trámites SAT" icono={<ChipImagen src="/images/sat-gold.png" />} />
        )}
        <div>
          <Link
            href="/?tab=comercializadora"
            onClick={onNavigate}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-creamSoft transition-colors hover:text-brand-gold"
          >
            <ChipImagen src="/images/comercializadora-gold.png" />
            Comercializadora
          </Link>
          <p className="mt-3 text-sm italic text-brand-creamSoft">Próximamente</p>
        </div>
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
  icono,
  servicios,
  onNavigate,
}: {
  titulo: string;
  icono?: ReactNode;
  servicios: ReturnType<typeof serviciosPorArea>;
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
        {icono}
        {titulo}
      </p>
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

function GrupoProximamente({ titulo, icono }: { titulo: string; icono?: ReactNode }) {
  return (
    <div className="opacity-50">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-creamSoft">
        {icono}
        {titulo}
      </p>
      <p className="mt-3 text-sm italic text-brand-creamSoft">Próximamente</p>
    </div>
  );
}

// Versiones doradas y sin fondo de las imágenes reales (public/images/*-gold.png),
// pensadas para verse directamente sobre el fondo oscuro del menú.
function ChipImagen({ src }: { src: string }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
      <Image src={src} alt="" width={32} height={32} unoptimized className="h-full w-full object-contain" />
    </span>
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
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
          <ChipImagen src="/images/sat-gold.png" />
          Trámites SAT
        </p>
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
        <Link
          href="/?tab=comercializadora"
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold"
        >
          <ChipImagen src="/images/comercializadora-gold.png" />
          Comercializadora
        </Link>
        <p className="py-1.5 text-sm italic text-brand-creamSoft/70">Próximamente</p>
      </div>
      <Link href="/servicios" className="py-1.5 text-sm font-semibold text-brand-gold">
        Ver todos →
      </Link>
    </div>
  );
}
