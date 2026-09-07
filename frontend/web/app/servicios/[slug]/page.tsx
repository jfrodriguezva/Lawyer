import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuestHeader from "@/components/GuestHeader";
import GuestPanel from "@/components/GuestPanel";
import Reveal from "@/components/Reveal";
import { IconCheck, IconMail, IconPhone, IconWhatsapp } from "@/components/icons";
import { getServicioPorSlug, SERVICIOS } from "@/lib/servicios";

export function generateStaticParams() {
  return SERVICIOS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servicio = getServicioPorSlug(slug);
  if (!servicio) return {};

  return {
    title: servicio.titulo,
    description: servicio.descripcion,
    openGraph: { title: servicio.titulo, description: servicio.descripcion },
  };
}

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servicio = getServicioPorSlug(slug);

  if (!servicio) {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-ink">
      <GuestHeader />

      <main className="relative mx-auto max-w-6xl px-6 pb-28">
        <section className="pt-14 lg:pt-20">
          <Reveal>
            <p className="font-script text-xl italic text-brand-gold">{servicio.frase}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-3 text-balance font-display text-5xl font-extrabold leading-[1.05] text-brand-cream sm:text-6xl">
              {servicio.titulo}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-lg text-brand-creamSoft">{servicio.descripcion}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-transform hover:-translate-y-0.5"
              >
                Agenda tu asesoría
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
        </section>

        <section className="mt-24 lg:mt-32">
          <Reveal>
            <p className="font-script text-lg italic text-brand-gold">Paso a paso</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Así avanza tu proceso
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {servicio.proceso.map((paso, i) => (
              <Reveal key={paso.numero} delay={120 + i * 100}>
                <div className="relative border border-brand-line bg-brand-ink2 p-7">
                  <span className="font-display text-4xl font-extrabold text-brand-gold/25">{paso.numero}</span>
                  <h3 className="mt-4 font-display text-lg font-bold text-brand-cream">{paso.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">{paso.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-24 lg:mt-32">
          <Reveal>
            <p className="font-script text-lg italic text-brand-gold">¿Por qué EC Abogados?</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Ventajas de este servicio
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {servicio.beneficios.map((b, i) => (
              <Reveal key={b.titulo} delay={100 + i * 70} className="border border-brand-line bg-brand-ink2 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold">
                  <IconCheck className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-brand-cream">{b.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">{b.texto}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contacto" className="mt-24 scroll-mt-24 lg:mt-32">
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
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <GuestPanel />
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
