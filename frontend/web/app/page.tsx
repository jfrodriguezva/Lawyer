import GuestHeader from "@/components/GuestHeader";
import LandingExperience from "@/components/LandingExperience";
import Reveal from "@/components/Reveal";

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

      {/* Toda la presentación pública vive en una sola experiencia por pestañas
          (Inicio/Servicios/Procesos/Quiénes somos/Misión), sin una sección de hero
          separada que repita lo que ya muestra la pestaña Inicio. */}
      <main className="relative mx-auto max-w-6xl px-6 pb-28 pt-14 lg:pt-20">
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
