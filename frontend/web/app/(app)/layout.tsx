"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Monogram from "@/components/Monogram";
import { IconMenu, IconClose } from "@/components/icons";
import { getCookie } from "@/lib/cookies";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const token = getCookie("ec_token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-creamSoft">
          Cargando…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-ink lg:flex-row">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />

      <div className="flex min-h-screen w-full flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <Monogram size={28} />
            <p className="font-display text-sm font-semibold tracking-wide text-brand-cream">
              EC ABOGADOS
            </p>
          </div>
          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex h-9 w-9 items-center justify-center border border-brand-line text-brand-cream transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            {navOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
          </button>
        </div>

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
