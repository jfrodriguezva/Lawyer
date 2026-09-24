import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GuestHeader from "@/components/GuestHeader";
import GuestPanel from "@/components/GuestPanel";
import Reveal from "@/components/Reveal";
import {
  IconBriefcase,
  IconCalculator,
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
  IconWhatsapp,
} from "@/components/icons";
import {
  getModulosPublicos,
  getServiciosActivos,
  getPromocionesActivasPublic,
  promocionImagenUrl,
  type IconoBeneficio,
  type Servicio,
} from "@/lib/api";
import { getServicioPorSlug } from "@/lib/servicios";

// El catálogo ahora vive en BD: sin esto, `next build` intenta prerenderizar
// esta página en build time y falla si la API no está corriendo en ese momento.
export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servicios = await getServiciosActivos();
  const servicio = getServicioPorSlug(servicios, slug);
  if (!servicio) return {};

  return {
    title: servicio.titulo,
    description: servicio.descripcion,
    alternates: { canonical: `/servicios/${slug}` },
    openGraph: { title: servicio.titulo, description: servicio.descripcion },
  };
}

function PromocionesDelServicio({ servicio, promociones }: { servicio: Servicio; promociones: Awaited<ReturnType<typeof getPromocionesActivasPublic>> }) {
  const propias = promociones.filter((p) => p.servicioIds.includes(servicio.id));
  if (propias.length === 0) return null;

  return (
    <section className="mt-10 space-y-5">
      {propias.map((promo) => (
        <Reveal key={promo.id}>
          <div className="flex flex-col gap-6 border border-brand-gold/50 bg-brand-gold/5 p-6 sm:flex-row sm:items-center">
            <div className="h-40 w-full shrink-0 overflow-hidden sm:h-32 sm:w-48">
              {/* Imagen dinámica servida por la API (no /public): next/image exige
                  configurar remotePatterns y, en local, choca con la protección
                  SSRF de Next contra IPs privadas (localhost). Un <img> normal
                  evita ambos problemas sin perder nada visualmente aquí. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promocionImagenUrl(promo.id)} alt="Promoción" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Promoción vigente</p>
              <p className="mt-2 text-base leading-relaxed text-brand-cream">{promo.texto}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [servicios, promociones, modulos] = await Promise.all([
    getServiciosActivos(),
    getPromocionesActivasPublic(),
    getModulosPublicos(),
  ]);
  const servicio = getServicioPorSlug(servicios, slug);

  if (!servicio) {
    notFound();
  }

  // Agente = módulo sin agenda propia todavía (Comercializadora, o cualquier
  // módulo nuevo asignado a ese rol): solo se ofrece el formulario de contacto.
  const aceptaCitas = modulos.find((m) => m.id === servicio.moduloId)?.rolResponsable !== "Agente";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-brand-ink">
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
                href="https://wa.me/525574334694"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-brand-line px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cream transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <IconWhatsapp className="h-4 w-4" />
                Escríbenos por WhatsApp
              </a>
            </div>
          </Reveal>

          <PromocionesDelServicio servicio={servicio} promociones={promociones} />
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
            <p className="font-script text-lg italic text-brand-gold">¿Por qué ECGAbogados?</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 text-balance font-display text-3xl font-bold text-brand-cream sm:text-4xl">
              Ventajas de este servicio
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {servicio.beneficios.map((b, i) => {
              const Icono = ICONOS_BENEFICIO[b.icono];
              return (
                <Reveal key={b.titulo} delay={100 + i * 70} className="border border-brand-line bg-brand-ink2 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold">
                    <Icono className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-brand-cream">{b.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-creamSoft">{b.texto}</p>
                </Reveal>
              );
            })}
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
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <GuestPanel servicioInteres={servicio.tipo ?? undefined} aceptaCitas={aceptaCitas} />
            </Reveal>
          </div>
        </section>

        <section className="mt-24 border-t border-brand-line pt-10 lg:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-creamSoft">Otros servicios</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {servicios
              .filter((s) => s.slug !== servicio.slug)
              .slice(0, 6)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/servicios/${s.slug}`}
                  className="border border-brand-line px-4 py-2 text-xs text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  {s.titulo}
                </Link>
              ))}
            <Link
              href="/servicios"
              className="border border-brand-gold/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink"
            >
              Ver todos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
