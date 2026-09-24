import type { Metadata } from "next";
import Link from "next/link";
import GuestHeader from "@/components/GuestHeader";
import Reveal from "@/components/Reveal";
import { IconArrowRight } from "@/components/icons";
import { getModulosPublicos, getServiciosActivos, type Servicio } from "@/lib/api";
import { agruparPorModulo } from "@/lib/servicios";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Derecho familiar, trámites fiscales ante el SAT y asesoría legal para empresas — conoce todos los servicios de ECGAbogados.",
  alternates: { canonical: "/servicios" },
};

// El catálogo ahora vive en BD: sin esto, `next build` intenta prerenderizar
// esta página en build time y falla si la API no está corriendo en ese momento.
export const dynamic = "force-dynamic";

function Grupo({ titulo, servicios }: { titulo: string; servicios: Servicio[] }) {
  if (servicios.length === 0) return null;

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

export default async function ServiciosIndexPage() {
  const [modulos, servicios] = await Promise.all([getModulosPublicos(), getServiciosActivos()]);
  // Solo módulos activos: los "Próximamente" (SAT/Comercializadora deshabilitados,
  // o cualquier módulo nuevo aún sin publicar) se anuncian en el NavBar, no aquí.
  const grupos = agruparPorModulo(modulos.filter((m) => m.activo), servicios);

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

        {grupos.map((grupo) => (
          <Grupo key={grupo.modulo.id} titulo={grupo.modulo.nombre} servicios={grupo.servicios} />
        ))}
      </main>
    </div>
  );
}
