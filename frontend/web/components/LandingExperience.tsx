"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import GuestPanel from "@/components/GuestPanel";
import Reveal from "@/components/Reveal";
import {
  IconArrowRight,
  IconBriefcase,
  IconCalculator,
  IconCheck,
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
import { getServicioPorSlug, type IconoBeneficio } from "@/lib/servicios";

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

// Solo 3 paneles se intercambian (se muestra uno, se ocultan los otros dos), sin
// apilarse: Servicios (con el proceso del servicio elegido), Quiénes somos y
// Misión y valores. Agendar no es un panel: es la sección fija de más abajo.
type Panel = "servicios" | "quienes-somos" | "mision";

const PANELES_VALIDOS: Panel[] = ["servicios", "quienes-somos", "mision"];

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

  const [panel, setPanel] = useState<Panel>(
    PANELES_VALIDOS.includes(tabParam as Panel) ? (tabParam as Panel) : "servicios"
  );
  const [servicioSlug, setServicioSlug] = useState(
    servicioParam && getServicioPorSlug(servicioParam) ? servicioParam : "divorcio-incausado"
  );
  const primerRender = useRef(true);

  // El menú del encabezado es la única navegación: Servicios (con ?servicio=) y
  // Quiénes somos/Misión (con ?tab=) llegan por la URL y se reflejan aquí. "Inicio"
  // limpia ambos parámetros, así que ese caso también restablece el servicio por
  // defecto — si no, "Inicio" subía al tope pero dejaba el último servicio elegido.
  useEffect(() => {
    if (servicioParam && getServicioPorSlug(servicioParam)) {
      setServicioSlug(servicioParam);
      setPanel("servicios");
    } else if (PANELES_VALIDOS.includes(tabParam as Panel)) {
      setPanel(tabParam as Panel);
    } else {
      setPanel("servicios");
      setServicioSlug("divorcio-incausado");
    }
  }, [tabParam, servicioParam]);

  // Al cambiar de panel llevamos la vista a su inicio: si el usuario estaba
  // desplazado hacia la agenda y elige otro panel arriba, debe verlo de inmediato.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    document.getElementById("panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [panel, servicioSlug]);

  const servicio = getServicioPorSlug(servicioSlug) ?? getServicioPorSlug("divorcio-incausado")!;

  return (
    <div>
      <div id="panel" className="scroll-mt-24">
        {panel === "servicios" && <PanelServicios servicio={servicio} />}
        {panel === "quienes-somos" && <PanelQuienesSomos />}
        {panel === "mision" && <PanelMision />}
      </div>

      <SeccionAgenda servicio={servicio} />
    </div>
  );
}

function PanelServicios({ servicio }: { servicio: ReturnType<typeof getServicioPorSlug> }) {
  if (!servicio) return null;

  return (
    <section className="pt-4 scroll-mt-24">
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

// Silueta de la justicia en dorado sólido: cabello recogido, venda en los ojos,
// brazo en alto con la balanza (cadenas y platillos) y toga con caída de tela,
// a juego con los tonos de la marca en vez del icono abstracto que había antes.
function JusticeMark() {
  return (
    <div className="relative mx-auto flex w-full max-w-[170px] items-center justify-center sm:max-w-[200px] lg:max-w-[240px]">
      <svg viewBox="0 0 220 280" className="h-auto w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Anillos decorativos, a juego con el resto de los emblemas de la marca */}
        <circle cx="112" cy="140" r="125" className="text-brand-gold" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" fill="none" />
        <circle cx="112" cy="140" r="104" className="text-brand-gold" stroke="currentColor" strokeOpacity="0.24" strokeWidth="1" fill="none" />

        <g className="text-brand-gold" fill="currentColor">
          {/* Cabeza y cabello recogido */}
          <circle cx="152" cy="30" r="14" />
          <circle cx="163" cy="16" r="8" />
          <path d="M166 12c3 1 4 5 2 8-1-3-2-5-5-6z" opacity="0.9" />

          {/* Venda sobre los ojos */}
          <rect x="138" y="27" width="29" height="6" rx="2" fill="#15130f" />

          {/* Brazo en alto */}
          <path d="M142 54 C 118 48 86 36 56 24 C 51 22 46 26 49 32 C 74 43 106 54 131 63 Z" />

          {/* Fiel: un poste corto entre la mano y la barra de la balanza */}
          <rect x="46" y="10" width="4" height="19" rx="1" />
          <circle cx="48" cy="10" r="3.2" />

          {/* Barra y cadenas de la balanza */}
          <rect x="6" y="12" width="86" height="3" rx="1.5" />
          <rect x="10" y="15" width="2" height="19" />
          <rect x="86" y="15" width="2" height="19" />

          {/* Platillos */}
          <path d="M2 34a12 6 0 0 0 24 0z" />
          <path d="M78 34a12 6 0 0 0 24 0z" />

          {/* Toga con caída de tela */}
          <path d="M140 49 C 121 58 110 82 115 109 C 118 130 109 152 105 178 C 102 197 106 219 120 235 L 178 235 C 184 213 176 191 179 168 C 182 140 175 108 161 76 C 156 65 149 55 140 49 Z" />
          <path
            d="M132 95c-3 40-10 82-16 132M148 95c3 40 10 82 16 132"
            stroke="#15130f"
            strokeOpacity="0.25"
            strokeWidth="2"
            fill="none"
          />

          {/* Base */}
          <rect x="96" y="235" width="90" height="10" rx="1.5" />
          <rect x="86" y="245" width="110" height="8" rx="1.5" />
        </g>
      </svg>
    </div>
  );
}

function PanelQuienesSomos() {
  return (
    <Reveal>
      <section className="pt-4 scroll-mt-24">
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
      </section>
    </Reveal>
  );
}

function PanelMision() {
  return (
    <Reveal>
      <section className="pt-4 scroll-mt-24">
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
      </section>
    </Reveal>
  );
}

// Sección de contacto/agenda: siempre presente, a todo lo ancho, al final de la
// página — no cambia con el panel activo, es lo único que nunca se oculta.
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
