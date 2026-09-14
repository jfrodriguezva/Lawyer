"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Monogram from "@/components/Monogram";

const SEGUNDOS_ESPERA = 4;

export default function NotFound() {
  const router = useRouter();
  const [segundos, setSegundos] = useState(SEGUNDOS_ESPERA);

  useEffect(() => {
    if (segundos <= 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [segundos, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-ink px-4 text-center">
      <Link href="/" className="flex flex-col items-center">
        <Monogram size={56} />
      </Link>

      <p className="mt-6 font-script text-lg italic text-brand-gold">Página no encontrada</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-brand-cream sm:text-3xl">
        Esta dirección ya no existe o nunca existió
      </h1>
      <p className="mt-4 max-w-sm text-sm text-brand-creamSoft">
        Te llevamos al inicio en {segundos} segundo{segundos === 1 ? "" : "s"}…
      </p>

      <Link
        href="/"
        className="mt-8 bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90"
      >
        Ir al inicio ahora
      </Link>
    </main>
  );
}
