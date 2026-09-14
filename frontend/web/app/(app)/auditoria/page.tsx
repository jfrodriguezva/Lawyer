"use client";

import { useEffect, useState } from "react";
import { getAuditoriaGlobal, type AuditoriaGlobalEntry } from "@/lib/api";

const PAGE_SIZE = 30;

export default function AuditoriaGlobalPage() {
  const [entradas, setEntradas] = useState<AuditoriaGlobalEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entidadFiltro, setEntidadFiltro] = useState("");

  function load() {
    setLoading(true);
    getAuditoriaGlobal(page, PAGE_SIZE, entidadFiltro || undefined)
      .then((res) => {
        setEntradas(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => setError("No se pudo cargar la bitácora (requiere rol Administrador)."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, entidadFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Registro de acciones sensibles</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Bitácora de auditoría</h1>

      <div className="mt-4">
        <select
          value={entidadFiltro}
          onChange={(e) => {
            setPage(1);
            setEntidadFiltro(e.target.value);
          }}
          className="border border-brand-line bg-brand-ink px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
        >
          <option value="">Todas las entidades</option>
          <option value="Caso">Caso</option>
          <option value="Prospecto">Prospecto</option>
          <option value="SolicitudCita">SolicitudCita</option>
        </select>
      </div>

      {error && <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>}
      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando…</p>}

      {!loading && entradas.length > 0 && (
        <div className="mt-6 overflow-x-auto border border-brand-line">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[1fr_1fr_2fr_1.5fr_1.5fr_1fr] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              <span>Entidad</span>
              <span>Id</span>
              <span>Acción</span>
              <span>Usuario</span>
              <span>Fecha</span>
              <span>IP</span>
            </div>
            {entradas.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_1fr_2fr_1.5fr_1.5fr_1fr] items-center gap-4 border-b border-brand-line px-5 py-3 text-sm text-brand-cream last:border-b-0">
                <span className="text-brand-creamSoft">{e.entidad}</span>
                <span className="text-brand-creamSoft">{e.entidadId}</span>
                <span>{e.accion}</span>
                <span className="text-brand-creamSoft">{e.usuarioNombre ?? "Público"}</span>
                <span className="text-brand-creamSoft">
                  {new Date(e.fecha).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-brand-creamSoft">{e.ip ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="mt-6 flex items-center justify-between text-xs text-brand-creamSoft">
          <span>{totalCount} registros · página {page} de {totalPaginas}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="border border-brand-line px-3 py-1.5 uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40">
              Anterior
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))} disabled={page >= totalPaginas} className="border border-brand-line px-3 py-1.5 uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
