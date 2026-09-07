"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Monogram from "@/components/Monogram";

const LINKS = [
  { href: "#proceso", label: "El proceso" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#contacto", label: "Contacto" },
];

export default function GuestHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "border-b border-brand-line bg-brand-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "py-3" : "py-6"
        }`}
      >
        <div className="flex items-center gap-3">
          <Monogram size={scrolled ? 32 : 40} />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-wide text-brand-cream">
              EC ABOGADOS
            </p>
            {!scrolled && (
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-creamSoft">
                Despacho Jurídico
              </p>
            )}
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] text-brand-creamSoft transition-colors hover:text-brand-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:text-brand-gold"
        >
          Acceso staff
        </Link>
      </div>
    </header>
  );
}
