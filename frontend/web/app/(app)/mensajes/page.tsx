"use client";

import { useEffect, useState } from "react";
import { getMensajesContactoPaginado, marcarMensajeAtendido, type MensajeContacto } from "@/lib/api";
import { SERVICIOS } from "@/lib/servicios";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const PAGE_SIZE = 20;

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicioFiltro, setServicioFiltro] = useState("");

  function load() {
    setLoading(true);
    getMensajesContactoPaginado(page, PAGE_SIZE)
      .then((res) => {
        setMensajes(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => setError("No se pudieron cargar los mensajes."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function handleAtendido(id: number) {
    try {
      await marcarMensajeAtendido(id);
      setMensajes((prev) => prev.map((m) => (m.id === id ? { ...m, atendido: true } : m)));
    } catch {
      setError("No se pudo actualizar el mensaje.");
    }
  }

  const mensajesFiltrados = servicioFiltro
    ? mensajes.filter((m) => m.servicioInteres === servicioFiltro)
    : mensajes;
  const pendientes = mensajesFiltrados.filter((m) => !m.atendido);
  const atendidos = mensajesFiltrados.filter((m) => m.atendido);
  const totalPaginas = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Buzón del sitio</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Mensajes</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Solicitudes enviadas desde el formulario de contacto público.
      </p>

      <div className="mt-4">
        <label htmlFor="filtro-servicio-mensajes" className="sr-only">
          Filtrar por servicio de interés
        </label>
        <select
          id="filtro-servicio-mensajes"
          value={servicioFiltro}
          onChange={(e) => setServicioFiltro(e.target.value)}
          className="border border-brand-line bg-brand-ink px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
        >
          <option value="">Todos los servicios</option>
          {SERVICIOS.map((s) => (
            <option key={s.slug} value={s.tipo}>
              {s.tipo}
            </option>
          ))}
        </select>
      </div>

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

      {!loading && totalCount > 0 && (
        <div className="mt-8 flex items-center justify-between text-xs text-brand-creamSoft">
          <span>
            {totalCount} mensaje{totalCount === 1 ? "" : "s"} en total · página {page} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="border border-brand-line px-3 py-1.5 uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page >= totalPaginas}
              className="border border-brand-line px-3 py-1.5 uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
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
      {mensaje.servicioInteres && (
        <p className="mt-2 text-[11px] uppercase tracking-widest text-brand-creamSoft">
          Interés: <span className="text-brand-gold">{mensaje.servicioInteres}</span>
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={buildWhatsAppLink(mensaje.telefono, `Hola ${mensaje.nombre}, te escribo de ECG Abogados por tu mensaje.`)}
          target="_blank"
          rel="noreferrer"
          className="border border-brand-line px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          Abrir WhatsApp
        </a>
        {!mensaje.atendido && (
          <button
            onClick={() => onAtendido(mensaje.id)}
            className="border border-brand-gold px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink"
          >
            Marcar como atendido
          </button>
        )}
      </div>
    </div>
  );
}
