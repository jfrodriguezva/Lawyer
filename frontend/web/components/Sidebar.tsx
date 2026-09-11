"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Monogram from "./Monogram";
import { IconPanel, IconFolder, IconCalendar, IconChat, IconLogout, IconUser, IconShield } from "./icons";
import { deleteCookie, getCookie } from "@/lib/cookies";

const NAV = [
  { href: "/dashboard", label: "Panel", icon: IconPanel },
  { href: "/casos", label: "Expedientes", icon: IconFolder },
  { href: "/agenda", label: "Agenda", icon: IconCalendar },
  { href: "/mensajes", label: "Mensajes", icon: IconChat },
];

const NAV_ADMIN = [
  { href: "/clientes", label: "Clientes", icon: IconShield },
  { href: "/usuarios", label: "Usuarios", icon: IconUser },
];

export default function Sidebar({
  open = false,
  onNavigate,
}: {
  open?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        setIsAdmin(JSON.parse(raw).rol === "Administrador");
      } catch {
        // ignore malformed cookie
      }
    }
  }, []);

  const items = isAdmin ? [...NAV, ...NAV_ADMIN] : NAV;

  function handleLogout() {
    deleteCookie("ec_token");
    deleteCookie("ec_user");
    onNavigate?.();
    router.push("/login");
  }

  return (
    <>
      {open && (
        <div
          onClick={onNavigate}
          aria-hidden
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-brand-line bg-brand-ink2 transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-brand-line px-6 py-6">
          <Monogram size={36} />
          <div>
            <p className="font-display text-sm font-semibold tracking-wide text-brand-cream">
              ECG ABOGADOS
            </p>
            <p className="font-script text-xs italic text-brand-creamSoft">
              Lic. Erika Cruz García
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 border px-4 py-2.5 text-sm uppercase tracking-widest transition-colors ${
                      active
                        ? "border-brand-gold/60 bg-brand-gold/10 text-brand-gold"
                        : "border-transparent text-brand-creamSoft hover:border-brand-line hover:text-brand-cream"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-brand-line px-3 py-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm uppercase tracking-widest text-brand-creamSoft transition-colors hover:text-brand-gold"
          >
            <IconLogout className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
