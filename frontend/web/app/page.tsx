import Link from "next/link";
import GuestHeader from "@/components/GuestHeader";
import GuestPanel from "@/components/GuestPanel";
import Reveal from "@/components/Reveal";
import {
  IconArrowRight,
  IconCheck,
  IconChat,
  IconMail,
  IconPhone,
  IconPin,
  IconShield,
  IconUser,
  IconWhatsapp,
} from "@/components/icons";
import { SERVICIOS } from "@/lib/servicios";

const BENEFICIOS = [
  {
    icon: IconUser,
    titulo: "Sin consentimiento del otro",
    texto: "No necesitas que tu pareja esté de acuerdo ni firme nada para iniciar el proceso.",
  },
  {
    icon: IconChat,
    titulo: "Asesoría personalizada",
    texto: "Analizamos tu situación particular antes de trazar la estrategia legal.",
  },
  {
    icon: IconCheck,
    titulo: "Acompañamiento total",
    texto: "Damos seguimiento a tu expediente desde el primer trámite hasta la sentencia.",
  },
  {
    icon: IconShield,
    titulo: "Protección familiar",
    texto: "Cuidamos tus derechos patrimoniales y los de tus hijas e hijos en todo momento.",
  },
  {
    icon: IconPin,
    titulo: "Presencial o en línea",
    texto: "Agenda tu asesoría en el despacho o resuélvela por videollamada, como prefieras.",
  },
];

const PROCESO = [
  {
    numero: "01",
    titulo: "Asesoría inicial",
    texto: "Revisamos tu situación, resolvemos tus dudas y evaluamos la viabilidad de tu caso sin compromiso.",
  },
  {
    numero: "02",
    titulo: "Presentación de la demanda",
    texto: "Preparamos el expediente y lo presentamos ante el juzgado familiar, sin requerir la firma de la otra parte.",
  },
  {
    numero: "03",
    titulo: "Resolución y sentencia",
    texto: "Te acompañamos en cada audiencia hasta obtener tu sentencia de divorcio y regularizar tu situación legal.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Attorney",
  name: "EC Abogados - Lic. Erika Cruz García",
  description: "Despacho jurídico especializado en divorcio incausado y derecho familiar.",
  telephone: "+525512592388",
  email: "erika.c.abogada@gmail.com",
  areaServed: "MX",
};

export default function GuestLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -left-32 top-[55%] h-80 w-80 rounded-full bg-brand-goldDeep/10 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />

      <GuestHeader />

      <main className="relative mx-auto max-w-6xl px-6 pb-28">
        {/* Hero */}
        <section className="grid grid-cols-1 gap-10 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
          <div>
            <Reveal>
              <p className="font-script text-xl italic text-brand-gold">
                Tu libertad también es un derecho
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-3 text-balance font-display text-5xl font-extrabold leading-[1.05] text-brand-cream sm:text-6xl">
                Divorcio incausado
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-lg text-brand-creamSoft">
                ¿Quieres divorciarte aunque tu pareja no esté de acuerdo? Te
                acompañamos en cada paso, de principio a fin, con la Lic.
                Erika Cruz García al frente de tu caso.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contacto"
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
            </Reveal>

            <Reveal delay={320}>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-brand-line pt-6">
                {["100% confidencial", "Sin trámites complicados", "Respuesta en menos de 24 h"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-brand-creamSoft"
                    >
                      <IconCheck className="h-3.5 w-3.5 text-brand-gold" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <JusticeMark />
          </Reveal>
        </section>

        {/* Proceso */}
        <section id="proceso" className="mt-28 scroll-mt-24 lg:mt-36">
          <Reveal>
            <p className="font-script text-lg italic text-brand-gold">Paso a paso</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Así avanza tu proceso
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PROCESO.map((paso, i) => (
              <Reveal key={paso.numero} delay={120 + i * 100}>
                <div className="relative border border-brand-line bg-brand-ink2 p-7">
                  <span className="font-display text-4xl font-extrabold text-brand-gold/25">
                    {paso.numero}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-brand-cream">
                    {paso.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">
                    {paso.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section id="beneficios" className="mt-28 scroll-mt-24 lg:mt-36">
          <Reveal>
            <p className="font-script text-lg italic text-brand-gold">¿Por qué EC Abogados?</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Ventajas del divorcio incausado
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFICIOS.map(({ icon: Icon, titulo, texto }, i) => (
              <Reveal
                key={titulo}
                delay={100 + i * 70}
                className="group border border-brand-line bg-brand-ink2 p-6 transition-colors duration-300 hover:border-brand-gold/50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-ink">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-brand-cream">
                  {titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">{texto}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Otros servicios */}
        <section className="mt-28 lg:mt-36">
          <Reveal>
            <p className="font-script text-lg italic text-brand-gold">También te acompañamos en</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Otros servicios de derecho familiar
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICIOS.map((s, i) => (
              <Reveal key={s.slug} delay={100 + i * 70}>
                <Link
                  href={`/servicios/${s.slug}`}
                  className="group flex h-full flex-col justify-between border border-brand-line bg-brand-ink2 p-6 transition-colors duration-300 hover:border-brand-gold/50"
                >
                  <div>
                    <h3 className="font-display text-base font-bold text-brand-cream">{s.titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">{s.descripcion}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-brand-gold">
                    Conocer más
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Contacto / agenda */}
        <section id="contacto" className="mt-28 scroll-mt-24 lg:mt-36">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="font-script text-lg italic text-brand-gold">Hablemos</p>
                  <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
                    Empieza una nueva etapa
                  </h2>
                  <p className="mt-4 max-w-md text-brand-creamSoft">
                    Escríbenos o agenda tu asesoría inicial. Te responderemos
                    personalmente para conocer tu caso.
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
                    href="mailto:erika.c.abogada@gmail.com"
                    className="flex items-center gap-3 text-sm text-brand-cream transition-all duration-200 hover:translate-x-1 hover:text-brand-gold"
                  >
                    <IconMail className="h-4 w-4 text-brand-gold" /> erika.c.abogada@gmail.com
                  </a>
                  <p className="pt-1 text-xs text-brand-creamSoft">Lic. Erika Cruz García</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <GuestPanel />
            </Reveal>
          </div>
        </section>

        <Reveal>
          <footer className="mt-24 border-t border-brand-line pt-8 text-center">
            <p className="font-script text-base italic text-brand-creamSoft">
              Empieza una nueva etapa. Estamos para ayudarte.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-brand-creamSoft/70">
              Profesionalismo · Compromiso · Resultados
            </p>
          </footer>
        </Reveal>
      </main>
    </div>
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
