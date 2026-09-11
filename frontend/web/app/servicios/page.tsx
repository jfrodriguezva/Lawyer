import type { Metadata } from "next";
import Link from "next/link";
import GuestHeader from "@/components/GuestHeader";
import Reveal from "@/components/Reveal";
import { IconArrowRight } from "@/components/icons";
import { SERVICIOS } from "@/lib/servicios";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Derecho familiar, trámites fiscales ante el SAT y asesoría legal para empresas — conoce todos los servicios de ECG Abogados.",
};

const FAMILIARES = [
  "divorcio-incausado",
  "divorcio-mutuo-consentimiento",
  "pension-alimenticia",
  "custodia",
  "regimen-de-visitas",
  "violencia-familiar",
];

const FISCAL_EMPRESARIAL = ["tramites-sat", "contratos", "cobranza-pagares", "sucesiones-herencias", "asesoria-empresas"];

function Grupo({ titulo, slugs }: { titulo: string; slugs: string[] }) {
  const servicios = slugs
    .map((slug) => SERVICIOS.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <section className="mt-16 first:mt-0">
      <h2 className="font-display text-2xl font-bold text-brand-cream">{titulo}</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {servicios.map((s, i) => (
          <Reveal key={s.slug} delay={i * 60}>
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
  );
}

export default function ServiciosIndexPage() {
  return (
    <div className="relative min-h-screen bg-brand-ink">
      <GuestHeader />
      <main className="relative mx-auto max-w-6xl px-6 pb-28 pt-14 lg:pt-20">
        <Reveal>
          <p className="font-script text-xl italic text-brand-gold">Tu causa, nuestra prioridad</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-2 text-balance font-display text-4xl font-extrabold text-brand-cream sm:text-5xl">
            Nuestros servicios
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-4 max-w-2xl text-lg text-brand-creamSoft">
            Derecho familiar, trámites fiscales y asesoría empresarial, con el mismo acompañamiento
            personalizado en cada caso.
          </p>
        </Reveal>

        <Grupo titulo="Derecho familiar" slugs={FAMILIARES} />
        <Grupo titulo="Asesoría fiscal y empresarial" slugs={FISCAL_EMPRESARIAL} />
      </main>
    </div>
  );
}
