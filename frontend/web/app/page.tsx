import GuestHeader from "@/components/GuestHeader";
import LandingExperience from "@/components/LandingExperience";
import Reveal from "@/components/Reveal";
import { IconArrowRight, IconCheck, IconWhatsapp } from "@/components/icons";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Attorney",
  name: "ECGAbogados - Lic. Erika Cruz García",
  description: "Despacho jurídico especializado en derecho familiar, trámites fiscales y asesoría empresarial.",
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
                Tu causa, nuestra prioridad
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-3 text-balance font-display text-5xl font-extrabold leading-[1.05] text-brand-cream sm:text-6xl">
                Divorcio incausado
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-lg text-brand-creamSoft">
                ¿Quieres divorciarte y tu pareja no está de acuerdo? En el
                divorcio incausado no necesitas su consentimiento, ni expresar
                una causa para solicitarlo. Te acompañamos en cada paso, de
                principio a fin, con la Lic. Erika Cruz García al frente de tu
                caso.
              </p>
            </Reveal>

            <Reveal delay={240}>
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
            </Reveal>

            <Reveal delay={320}>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-brand-line pt-6">
                {["100% confidencial", "No necesitas el consentimiento de tu pareja", "Respuesta en menos de 24 h"].map(
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

        <LandingExperience />

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
