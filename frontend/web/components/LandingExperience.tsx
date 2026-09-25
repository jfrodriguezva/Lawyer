"use client";

import Image from "next/image";
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
import {
  promocionImagenUrl,
  type IconoBeneficio,
  type PromocionPublica,
  type Servicio,
} from "@/lib/api";
import { getServicioPorSlug } from "@/lib/servicios";
import { useCatalogoPublico } from "@/lib/useCatalogoPublico";

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

// Los paneles se intercambian (se muestra uno, se ocultan los demás), sin
// apilarse: Servicios (con el proceso del servicio elegido), Quiénes somos,
// Misión y valores, y Comercializadora (en construcción). Agendar no es un
// panel: es la sección fija de más abajo.
type Panel = "servicios" | "quienes-somos" | "mision" | "comercializadora";

const PANELES_VALIDOS: Panel[] = ["servicios", "quienes-somos", "mision", "comercializadora"];

const SLUG_SAT = "tramites-sat";

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

  const { modulos, servicios, promociones } = useCatalogoPublico();
  const [panel, setPanel] = useState<Panel>(
    PANELES_VALIDOS.includes(tabParam as Panel) ? (tabParam as Panel) : "servicios"
  );
  const [servicioSlug, setServicioSlug] = useState(servicioParam ?? "divorcio-incausado");
  const primerRender = useRef(true);

  // El menú del encabezado es la única navegación: Servicios (con ?servicio=) y
  // Quiénes somos/Misión (con ?tab=) llegan por la URL y se reflejan aquí. "Inicio"
  // limpia ambos parámetros, así que ese caso también restablece el servicio por
  // defecto — si no, "Inicio" subía al tope pero dejaba el último servicio elegido.
  // Depende también de `servicios`: hasta que termine de cargar no se puede saber
  // si servicioParam corresponde a un servicio real.
  useEffect(() => {
    if (servicios.length === 0) return;
    if (servicioParam && getServicioPorSlug(servicios, servicioParam)) {
      setServicioSlug(servicioParam);
      setPanel("servicios");
    } else if (PANELES_VALIDOS.includes(tabParam as Panel)) {
      setPanel(tabParam as Panel);
    } else {
      setPanel("servicios");
      setServicioSlug("divorcio-incausado");
    }
  }, [tabParam, servicioParam, servicios]);

  // Al cambiar de panel llevamos la vista a su inicio: si el usuario estaba
  // desplazado hacia la agenda y elige otro panel arriba, debe verlo de inmediato.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    document.getElementById("panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [panel, servicioSlug]);

  const servicio = getServicioPorSlug(servicios, servicioSlug) ?? getServicioPorSlug(servicios, "divorcio-incausado");
  // Agente = módulo sin agenda propia todavía (Comercializadora, o cualquier
  // módulo nuevo asignado a ese rol): solo se ofrece el formulario de contacto.
  const aceptaCitas = servicio ? modulos.find((m) => m.id === servicio.moduloId)?.rolResponsable !== "Agente" : true;
  // Un servicio solo puede tener una promoción activa (garantizado por el backend).
  const promocion = servicio ? promociones.find((p) => p.servicioIds.includes(servicio.id)) : undefined;

  return (
    <div>
      <div id="panel" className="scroll-mt-24">
        {panel === "servicios" && <PanelServicios servicio={servicio} promocion={promocion} />}
        {panel === "quienes-somos" && <PanelQuienesSomos />}
        {panel === "mision" && <PanelMision />}
        {panel === "comercializadora" && <PanelComercializadora />}
      </div>

      <SeccionAgenda servicio={servicio} aceptaCitas={aceptaCitas} />
    </div>
  );
}

function PanelServicios({ servicio, promocion }: { servicio: Servicio | undefined; promocion: PromocionPublica | undefined }) {
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
                href="https://wa.me/525574334694"
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

          {promocion ? (
            <ImagenPromocion promocion={promocion} />
          ) : servicio.slug === SLUG_SAT ? (
            <ImagenEmblema src="/images/sat-gold.png" width={348} height={402} alt="Símbolo de trámites ante el SAT" />
          ) : (
            <ImagenEmblema
              src="/images/justicia-gold.png"
              width={427}
              height={719}
              alt="La justicia: venda en los ojos, balanza y espada"
            />
          )}
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

// Emblema del panel activo: las versiones "-gold" de las imágenes reales (ver
// public/images) ya tienen el fondo eliminado y el trazo negro pasado a dorado,
// así que se colocan directamente, sin tarjeta ni anillo de fondo.
function ImagenEmblema({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-[200px] items-center justify-center sm:max-w-[230px] lg:max-w-[270px]">
      <Image
        key={src}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="relative h-auto w-full drop-shadow-[0_20px_35px_rgba(201,162,74,0.35)]"
        priority
      />
    </div>
  );
}

// Cuando el servicio elegido tiene una promoción activa, su imagen sustituye
// al emblema genérico (justicia/SAT) en el hero -- así se ve de inmediato,
// sin tener que bajar hasta el banner de "Paso a paso". <img> normal, no
// next/image: la imagen la sirve la API (App_Data/promociones), no /public.
function ImagenPromocion({ promocion }: { promocion: PromocionPublica }) {
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-sm bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg">
        Promoción vigente
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={promocionImagenUrl(promocion.id)}
        alt="Promoción vigente"
        className="w-full border-2 border-red-600 object-cover shadow-[0_20px_45px_-15px_rgba(220,38,38,0.5)]"
      />
    </div>
  );
}

function PanelQuienesSomos() {
  return (
    <Reveal>
      <section className="pt-4 scroll-mt-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
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
          </div>

          <div className="mx-auto shrink-0">
            <Image
              src="/images/logo-ecg.png"
              alt="Sello ECG Abogados — Erika Cruz García"
              width={280}
              height={280}
              className="h-40 w-40 rounded-full ring-1 ring-brand-gold/70 drop-shadow-[0_10px_30px_rgba(201,162,74,0.3)] sm:h-52 sm:w-52"
            />
          </div>
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

function PanelComercializadora() {
  return (
    <Reveal>
      <section className="pt-4 scroll-mt-24">
        <div className="flex flex-col items-center gap-6 border border-brand-line bg-brand-ink2 px-8 py-16 text-center">
          <Image
            src="/images/comercializadora-gold.png"
            alt="Comercializadora"
            width={554}
            height={554}
            className="h-16 w-16"
          />
          <div>
            <p className="font-script text-lg italic text-brand-gold">Próximamente</p>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Comercializadora en construcción
            </h2>
          </div>
          <p className="max-w-xl text-brand-creamSoft">
            Este módulo todavía no está disponible. Cuando esté listo, aquí encontrarás la parte comercial del
            despacho — por ahora, puedes seguir agendando tu asesoría jurídica o de trámites SAT desde este mismo
            sitio.
          </p>
        </div>
      </section>
    </Reveal>
  );
}

// Sección de contacto/agenda: siempre presente, a todo lo ancho, al final de la
// página — no cambia con el panel activo, es lo único que nunca se oculta.
function SeccionAgenda({ servicio, aceptaCitas }: { servicio: Servicio | undefined; aceptaCitas: boolean }) {
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
                href="https://wa.me/525574334694"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-brand-cream transition-all duration-200 hover:translate-x-1 hover:text-brand-gold"
              >
                <IconWhatsapp className="h-4 w-4 text-brand-gold" /> WhatsApp · 55 7433 4694
              </a>
              <a
                href="tel:+525574334694"
                className="flex items-center gap-3 text-sm text-brand-cream transition-all duration-200 hover:translate-x-1 hover:text-brand-gold"
              >
                <IconPhone className="h-4 w-4 text-brand-gold" /> Tel · 55 7433 4694
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
          <GuestPanel servicioInteres={servicio?.tipo ?? undefined} aceptaCitas={aceptaCitas} />
        </Reveal>
      </div>
    </section>
  );
}
