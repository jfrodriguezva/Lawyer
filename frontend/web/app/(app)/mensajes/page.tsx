"use client";

import { useEffect, useState } from "react";
import { getMensajesContacto, marcarMensajeAtendido, type MensajeContacto } from "@/lib/api";

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getMensajesContacto()
      .then(setMensajes)
      .catch(() => setError("No se pudieron cargar los mensajes."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAtendido(id: number) {
    try {
      await marcarMensajeAtendido(id);
      setMensajes((prev) => prev.map((m) => (m.id === id ? { ...m, atendido: true } : m)));
    } catch {
      setError("No se pudo actualizar el mensaje.");
    }
  }

  const pendientes = mensajes.filter((m) => !m.atendido);
  const atendidos = mensajes.filter((m) => m.atendido);

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Buzón del sitio</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Mensajes</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Solicitudes enviadas desde el formulario de contacto público.
      </p>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-8 text-sm text-brand-creamSoft">Cargando mensajes…</p>
      )}

      {!loading && mensajes.length === 0 && (
        <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay mensajes.</p>
      )}

      {!loading && pendientes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Pendientes ({pendientes.length})
          </h2>
          <div className="mt-3 space-y-3">
            {pendientes.map((m) => (
              <MensajeCard key={m.id} mensaje={m} onAtendido={handleAtendido} />
            ))}
          </div>
        </div>
      )}

      {!loading && atendidos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Atendidos ({atendidos.length})
          </h2>
          <div className="mt-3 space-y-3">
            {atendidos.map((m) => (
              <MensajeCard key={m.id} mensaje={m} onAtendido={handleAtendido} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MensajeCard({
  mensaje,
  onAtendido,
}: {
  mensaje: MensajeContacto;
  onAtendido: (id: number) => void;
}) {
  return (
    <div
      className={`border px-5 py-4 transition-colors ${
        mensaje.atendido
          ? "border-brand-line bg-brand-ink2/60"
          : "border-brand-gold/50 bg-brand-ink2"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-cream">{mensaje.nombre}</p>
          <p className="text-xs text-brand-creamSoft">
            {mensaje.telefono}
            {mensaje.email ? ` · ${mensaje.email}` : ""}
          </p>
        </div>
        <span className="text-xs text-brand-creamSoft">
          {new Date(mensaje.fechaEnvio).toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-brand-cream">{mensaje.mensaje}</p>
      {!mensaje.atendido && (
        <button
          onClick={() => onAtendido(mensaje.id)}
          className="mt-4 border border-brand-gold px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink"
        >
          Marcar como atendido
        </button>
      )}
    </div>
  );
}
