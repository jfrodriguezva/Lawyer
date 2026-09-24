"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Monogram from "./Monogram";
import {
  IconPanel,
  IconFolder,
  IconCalendar,
  IconChat,
  IconLogout,
  IconUser,
  IconShield,
  IconClock,
  IconHandHeart,
  IconBriefcase,
  IconFile,
  IconLock,
  IconCalculator,
  IconDocumentLegal,
  IconMegaphone,
} from "./icons";
import { deleteCookie, getCookie } from "@/lib/cookies";
import { getFlags } from "@/lib/api";

// Visible para Abogado y Administrador: es el módulo jurídico completo.
const NAV_JURIDICO = [
  { href: "/dashboard", label: "Panel", icon: IconPanel },
  { href: "/solicitudes", label: "Solicitudes", icon: IconClock },
  { href: "/prospectos", label: "Prospectos", icon: IconHandHeart },
  { href: "/casos", label: "Expedientes", icon: IconFolder },
  { href: "/clientes", label: "Clientes", icon: IconShield },
  { href: "/agenda", label: "Agenda", icon: IconCalendar },
  { href: "/mensajes", label: "Mensajes", icon: IconChat },
  { href: "/reportes", label: "Reportes", icon: IconBriefcase },
  { href: "/plantillas", label: "Plantillas", icon: IconFile },
];

// Visible únicamente para el rol Consultor (Administrador ya ve "Solicitudes"
// en NAV_JURIDICO y "Trámites SAT" en NAV_ADMIN, sin duplicar el enlace).
const NAV_SAT_CONSULTOR = [
  { href: "/solicitudes", label: "Solicitudes SAT", icon: IconClock },
  { href: "/tramites-sat", label: "Trámites SAT", icon: IconCalculator },
];

// Solo Administrador: configuración global, no expedientes de casos.
const NAV_ADMIN = [
  { href: "/catalogo-servicios", label: "Servicios", icon: IconBriefcase },
  { href: "/promociones", label: "Promociones", icon: IconMegaphone },
  { href: "/usuarios", label: "Usuarios", icon: IconUser },
  { href: "/tramites-sat", label: "Trámites SAT", icon: IconCalculator },
  { href: "/catalogo-sat", label: "Catálogo SAT", icon: IconDocumentLegal },
  { href: "/auditoria", label: "Auditoría", icon: IconLock },
];

// Visible para cualquier rol autenticado del staff.
const NAV_PERFIL = [{ href: "/perfil", label: "Mi perfil", icon: IconUser }];

export default function Sidebar({
  open = false,
  onNavigate,
}: {
  open?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [satHabilitado, setSatHabilitado] = useState(false);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        setRol(JSON.parse(raw).rol ?? null);
      } catch {
        // ignore malformed cookie
      }
    }
    getFlags()
      .then((flags) => setSatHabilitado(flags.satHabilitado))
      .catch(() => undefined);
  }, []);

  const esAdministrador = rol === "Administrador";
  const esModuloJuridico = rol === "Abogado" || esAdministrador;
  const esConsultor = rol === "Consultor" && satHabilitado;

  const items = [
    ...(esModuloJuridico ? NAV_JURIDICO : []),
    ...(esConsultor ? NAV_SAT_CONSULTOR : []),
    ...(esAdministrador ? NAV_ADMIN.filter((item) => item.href !== "/tramites-sat" || satHabilitado) : []),
    ...(rol ? NAV_PERFIL : []),
  ];

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
              ECGABOGADOS
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

          {!esModuloJuridico && !esAdministrador && !esConsultor && rol && (
            <p className="mt-6 px-4 text-xs text-brand-creamSoft">
              Tu rol ({rol}) todavía no tiene un módulo activo en este panel.
            </p>
          )}
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
