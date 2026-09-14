"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBell } from "@/components/icons";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas, type Notificacion } from "@/lib/api";

export default function NotificationBell() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [open, setOpen] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  function cargar() {
    getNotificaciones()
      .then(setNotificaciones)
      .catch(() => undefined);
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  async function handleClickNotificacion(n: Notificacion) {
    if (!n.leida) {
      await marcarNotificacionLeida(n.id).catch(() => undefined);
      setNotificaciones((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    }
    setOpen(false);
    if (n.enlace) router.push(n.enlace);
  }

  async function handleMarcarTodas() {
    await marcarTodasNotificacionesLeidas().catch(() => undefined);
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center border border-brand-line text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
      >
        <IconBell className="h-4 w-4" />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[9px] font-bold text-brand-ink">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] border border-brand-line bg-brand-ink2 shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-line px-4 py-2.5">
            <span className="text-[11px] font-medium uppercase tracking-widest text-brand-creamSoft">Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodas} className="text-[10px] uppercase tracking-widest text-brand-gold hover:underline">
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-brand-creamSoft">Sin notificaciones.</p>
            )}
            {notificaciones.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickNotificacion(n)}
                className={`block w-full border-b border-brand-line px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-brand-ink ${
                  n.leida ? "opacity-60" : ""
                }`}
              >
                <p className="text-sm text-brand-cream">{n.titulo}</p>
                <p className="mt-0.5 text-xs text-brand-creamSoft">{n.mensaje}</p>
                <p className="mt-1 text-[10px] text-brand-creamSoft/70">
                  {new Date(n.fecha).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
