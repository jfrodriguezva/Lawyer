"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GuestPanel from "@/components/GuestPanel";
import Reveal from "@/components/Reveal";
import { getFlags } from "@/lib/api";
import {
  IconArrowRight,
  IconBriefcase,
  IconCalculator,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconDocumentLegal,
  IconFamily,
  IconGavel,
  IconHandHeart,
  IconLock,
  IconMail,
  IconMoney,
  IconPhone,
  IconPin,
  IconScale,
  IconShield,
  IconUser,
  IconWhatsapp,
} from "@/components/icons";
import {
  AREA_EMPRESARIAL,
  AREA_FAMILIAR,
  AREA_SAT,
  getServicioPorSlug,
  serviciosPorArea,
  type IconoBeneficio,
} from "@/lib/servicios";

const ICONOS_BENEFICIO: Record<IconoBeneficio, typeof IconScale> = {
  scale: IconScale,
  gavel: IconGavel,
  document: IconDocumentLegal,
  family: IconFamily,
  clock: IconClock,
  lock: IconLock,
  handHeart: IconHandHeart,
  pin: IconPin,
  money: IconMoney,
  briefcase: IconBriefcase,
  calculator: IconCalculator,
};

type SeccionExtra = "procesos" | "quienes-somos" | "mision" | null;

const SECCIONES_VALIDAS: SeccionExtra[] = ["procesos", "quienes-somos", "mision"];

const VALORES = [
  { titulo: "Integridad", texto: "Decimos lo que pensamos y actuamos conforme a lo que decimos, incluso cuando es la respuesta difícil." },
  { titulo: "Compromiso", texto: "Cada expediente recibe seguimiento puntual, de principio a fin, no solo en la etapa inicial." },
  { titulo: "Confidencialidad", texto: "Tu situación personal o familiar se maneja con total discreción, dentro y fuera del despacho." },
  { titulo: "Empatía", texto: "Escuchamos antes de aconsejar, entendiendo que detrás de cada caso hay una historia y una familia." },
  { titulo: "Excelencia", texto: "Preparamos cada trámite y cada audiencia con el mismo cuidado, sin importar el tamaño del asunto." },
];

export default function LandingExperience() {
  return (
    <Suspense fallback={null}>
      <LandingExperienceInner />
    </Suspense>
  );
}

function LandingExperienceInner() {
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const servicioParam = searchParams.get("servicio");

  const [seccion, setSeccion] = useState<SeccionExtra>(
    SECCIONES_VALIDAS.includes(tabParam as SeccionExtra) ? (tabParam as SeccionExtra) : null
  );
  const [servicioSlug, setServicioSlug] = useState(
    servicioParam && getServicioPorSlug(servicioParam) ? servicioParam : "divorcio-incausado"
  );
  const [satHabilitado, setSatHabilitado] = useState(false);

  useEffect(() => {
    getFlags()
      .then((flags) => setSatHabilitado(flags.satHabilitado))
      .catch(() => undefined);
  }, []);

  // Un enlace externo (menú de Servicios del encabezado, "Inicio") puede llegar con
  // ?servicio= o ?tab= en la URL; sincronizamos el estado interno cuando cambian.
  useEffect(() => {
    if (servicioParam && getServicioPorSlug(servicioParam)) {
      setServicioSlug(servicioParam);
      setSeccion(null);
    } else if (SECCIONES_VALIDAS.includes(tabParam as SeccionExtra)) {
      setSeccion(tabParam as SeccionExtra);
    } else {
      setSeccion(null);
    }
  }, [tabParam, servicioParam]);

  // Al entrar a Procesos/Quiénes somos/Misión desde el encabezado, la sección se
  // agrega debajo del servicio destacado; sin este scroll el clic parecía no hacer
  // nada porque la parte visible de la pantalla no cambiaba.
  useEffect(() => {
    if (!seccion) return;
    const el = document.getElementById("explorar");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [seccion]);

  const servicio = getServicioPorSlug(servicioSlug) ?? getServicioPorSlug("divorcio-incausado")!;

  return (
    <div>
      {/* El servicio destacado es siempre lo primero que se ve, sin pestañas propias:
          el encabezado (Inicio/Servicios/Procesos/Quiénes somos/Misión) ya es la única
          navegación de la página. */}
      <ServicioDestacado servicio={servicio} />

      {seccion && (
        <section id="explorar" className="mt-20 scroll-mt-24 border-t border-brand-line pt-14 lg:mt-28">
          {seccion === "procesos" && <SeccionProcesos satHabilitado={satHabilitado} />}
          {seccion === "quienes-somos" && <SeccionQuienesSomos />}
          {seccion === "mision" && <SeccionMision />}
        </section>
      )}

      <SeccionAgenda servicio={servicio} />
    </div>
  );
}

function ServicioDestacado({ servicio }: { servicio: ReturnType<typeof getServicioPorSlug> }) {
  if (!servicio) return null;

  return (
    <section className="pt-4">
      <Reveal key={servicio.slug}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="font-script text-xl italic text-brand-gold">{servicio.frase}</p>
            <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.05] text-brand-cream sm:text-5xl lg:text-6xl">
              {servicio.titulo}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-creamSoft">{servicio.descripcion}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#agenda"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-transform hover:-translate-y-0.5"
              >
                Agenda tu asesoría hoy
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="https://wa.me/522205801140"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-brand-line px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cream transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <IconWhatsapp className="h-4 w-4" />
                Escríbenos por WhatsApp
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-brand-line pt-6">
              {["100% confidencial", "Trato directo con tu abogada", "Respuesta en menos de 24 h"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-brand-creamSoft">
                  <IconCheck className="h-3.5 w-3.5 text-brand-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <JusticeMark />
        </div>
      </Reveal>

      <div className="mt-16 lg:mt-20">
        <Reveal delay={80}>
          <p className="font-script text-lg italic text-brand-gold">Paso a paso</p>
          <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
            Así avanza tu proceso
          </h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {servicio.proceso.map((paso, i) => (
            <Reveal key={paso.numero} delay={120 + i * 80}>
              <div className="h-full border border-brand-line bg-brand-ink2 p-6">
                <span className="font-display text-3xl font-extrabold text-brand-gold/25">{paso.numero}</span>
                <h3 className="mt-3 font-display text-base font-bold text-brand-cream">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">{paso.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {servicio.beneficios.map((b, i) => {
            const Icono = ICONOS_BENEFICIO[b.icono];
            return (
              <Reveal key={b.titulo} delay={160 + i * 80}>
                <div className="flex gap-4 border border-brand-line bg-brand-ink2 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold">
                    <Icono className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-brand-cream">{b.titulo}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-creamSoft">{b.texto}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={280}>
          <Link
            href="/servicios"
            className="mt-8 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-brand-gold hover:underline"
          >
            Ver la ficha completa de cada servicio
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function JusticeMark() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center sm:max-w-[260px] lg:max-w-sm">
      <svg
        viewBox="0 0 240 240"
        className="h-full w-full max-w-[22rem] text-brand-gold/70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="120" cy="120" r="115" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <circle cx="120" cy="120" r="90" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="120" y1="45" x2="120" y2="150" stroke="currentColor" strokeWidth="1.5" />
        <line x1="60" y1="70" x2="180" y2="70" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 70 40 110a20 20 0 0 0 40 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M180 70 160 110a20 20 0 0 0 40 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="95" y1="185" x2="145" y2="185" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="120" y1="150" x2="120" y2="185" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="120" cy="70" r="6" fill="currentColor" fillOpacity="0.6" />
      </svg>
    </div>
  );
}

function SeccionProcesos({ satHabilitado }: { satHabilitado: boolean }) {
  const familiares = serviciosPorArea(AREA_FAMILIAR);
  const empresarial = serviciosPorArea(AREA_EMPRESARIAL);
  const sat = serviciosPorArea(AREA_SAT);
  const [abierto, setAbierto] = useState<string>(familiares[0].slug);

  return (
    <Reveal>
      <p className="font-script text-lg italic text-brand-gold">Paso a paso</p>
      <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
        Así avanza cada tipo de caso
      </h2>
      <p className="mt-4 max-w-2xl text-brand-creamSoft">
        Cada asunto sigue su propio procedimiento legal. Consulta cómo avanza el tuyo, desde la primera asesoría
        hasta la resolución.
      </p>

      <div className="mt-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Derecho familiar</p>
        <ProcesoAcordeon servicios={familiares} abierto={abierto} onToggle={setAbierto} />

        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
          Fiscal y empresarial
        </p>
        <ProcesoAcordeon servicios={empresarial} abierto={abierto} onToggle={setAbierto} />

        {satHabilitado && (
          <>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Trámites SAT
            </p>
            <ProcesoAcordeon servicios={sat} abierto={abierto} onToggle={setAbierto} />
          </>
        )}
      </div>
    </Reveal>
  );
}

function ProcesoAcordeon({
  servicios,
  abierto,
  onToggle,
}: {
  servicios: ReturnType<typeof serviciosPorArea>;
  abierto: string;
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="mt-3 divide-y divide-brand-line border border-brand-line">
      {servicios.map((s) => {
        const expandido = abierto === s.slug;
        return (
          <div key={s.slug} className="bg-brand-ink2">
            <button
              type="button"
              onClick={() => onToggle(expandido ? "" : s.slug)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              aria-expanded={expandido}
            >
              <span className="font-display text-sm font-bold text-brand-cream">{s.titulo}</span>
              <IconChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-brand-gold transition-transform ${expandido ? "rotate-180" : ""}`}
              />
            </button>
            {expandido && (
              <div className="grid grid-cols-1 gap-3 border-t border-brand-line px-4 py-4 sm:grid-cols-3">
                {s.proceso.map((paso) => (
                  <div key={paso.numero}>
                    <span className="font-display text-lg font-extrabold text-brand-gold/30">{paso.numero}</span>
                    <h4 className="mt-1 font-display text-xs font-bold text-brand-cream">{paso.titulo}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-brand-creamSoft">{paso.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeccionQuienesSomos() {
  return (
    <Reveal>
      <p className="font-script text-lg italic text-brand-gold">Quiénes somos</p>
      <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
        Un despacho cercano, con respaldo profesional
      </h2>
      <div className="mt-6 max-w-2xl space-y-4 text-brand-creamSoft">
        <p>
          ECGAbogados es un despacho jurídico encabezado por la Lic. Erika Cruz García, especializado en derecho
          familiar, trámites fiscales y asesoría legal para empresas y emprendedores.
        </p>
        <p>
          Atendemos cada asunto de forma personalizada: revisamos tu situación particular antes de proponer una
          estrategia, y damos seguimiento cercano a tu expediente desde la primera consulta hasta su resolución.
        </p>
        <p>
          Ofrecemos asesoría presencial o en línea, según lo que te resulte más cómodo, siempre con la misma
          seriedad, confidencialidad y trato humano.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex gap-3 border border-brand-line bg-brand-ink2 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold">
            <IconUser className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-brand-cream">Trato directo con tu abogada</h3>
            <p className="mt-1 text-xs leading-relaxed text-brand-creamSoft">
              Tu caso lo revisa y acompaña la Lic. Erika Cruz García, no un intermediario.
            </p>
          </div>
        </div>
        <div className="flex gap-3 border border-brand-line bg-brand-ink2 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold">
            <IconShield className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-brand-cream">Confidencialidad ante todo</h3>
            <p className="mt-1 text-xs leading-relaxed text-brand-creamSoft">
              Tus datos y tu situación personal se manejan con total discreción, en todo momento.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function SeccionMision() {
  return (
    <Reveal>
      <p className="font-script text-lg italic text-brand-gold">Lo que nos guía</p>
      <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
        Misión, visión y valores
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="border border-brand-line bg-brand-ink2 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Misión</p>
          <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">
            Ofrecer asesoría y representación legal cercana y confiable en materia familiar, fiscal y empresarial,
            acompañando a cada persona y negocio en la resolución de su situación con claridad y compromiso.
          </p>
        </div>
        <div className="border border-brand-line bg-brand-ink2 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Visión</p>
          <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">
            Ser un despacho de referencia por la calidad de su acompañamiento legal, reconocido por la confianza y
            tranquilidad que brinda a quienes atraviesan un proceso familiar, fiscal o de negocio.
          </p>
        </div>
        <div className="border border-brand-line bg-brand-ink2 p-6 sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Propósito</p>
          <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">
            Que cada cliente sienta que su caso importa y que cuenta con el respaldo legal necesario para tomar
            decisiones informadas, con acompañamiento humano en cada etapa del proceso.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Valores</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VALORES.map((v) => (
            <div key={v.titulo} className="border border-brand-line bg-brand-ink2 p-5">
              <h3 className="font-display text-sm font-bold text-brand-cream">{v.titulo}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-creamSoft">{v.texto}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border border-brand-gold/40 bg-brand-gold/5 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Objetivo</p>
        <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">
          Acompañarte hasta la resolución de tu asunto legal, con un seguimiento puntual de tu expediente y
          comunicación clara en cada paso, para que enfrentes tu proceso con la certeza de no estar solo.
        </p>
      </div>
    </Reveal>
  );
}

// Sección de contacto/agenda: siempre al final de la página, a todo lo ancho — ya
// no es una columna lateral fija, para dejar que el servicio destacado sea lo
// principal arriba.
function SeccionAgenda({ servicio }: { servicio: ReturnType<typeof getServicioPorSlug> }) {
  return (
    <section id="agenda" className="mt-20 scroll-mt-24 border-t border-brand-line pt-14 lg:mt-28">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="font-script text-lg italic text-brand-gold">Hablemos</p>
              <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
                Empieza una nueva etapa
              </h2>
              <p className="mt-4 max-w-md text-brand-creamSoft">
                Escríbenos o agenda tu asesoría inicial. Te responderemos personalmente para conocer tu caso.
              </p>
            </div>

            <div className="mt-8 space-y-3 border border-brand-line bg-brand-ink2 p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Contáctanos directamente
              </p>
              <a
                href="https://wa.me/522205801140"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-brand-cream transition-all duration-200 hover:translate-x-1 hover:text-brand-gold"
              >
                <IconWhatsapp className="h-4 w-4 text-brand-gold" /> WhatsApp · 220 580 1140
              </a>
              <a
                href="tel:+525512592388"
                className="flex items-center gap-3 text-sm text-brand-cream transition-all duration-200 hover:translate-x-1 hover:text-brand-gold"
              >
                <IconPhone className="h-4 w-4 text-brand-gold" /> Tel · 55 12 59 23 88
              </a>
              <a
                href="mailto:contacto@ecgabogados.com"
                className="flex items-center gap-3 text-sm text-brand-cream transition-all duration-200 hover:translate-x-1 hover:text-brand-gold"
              >
                <IconMail className="h-4 w-4 text-brand-gold" /> contacto@ecgabogados.com
              </a>
              <p className="pt-1 text-xs text-brand-creamSoft">Lic. Erika Cruz García</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <GuestPanel servicioInteres={servicio?.tipo} />
        </Reveal>
      </div>
    </section>
  );
}
