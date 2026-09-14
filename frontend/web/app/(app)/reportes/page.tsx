"use client";

import { useEffect, useState } from "react";
import { getReporteCasos, getUsuarios, type EstatusCaso, type ReporteCasos, type Usuario } from "@/lib/api";

const ESTATUSES: EstatusCaso[] = ["Activo", "Revision", "Cerrado"];

export default function ReportesPage() {
  const [reporte, setReporte] = useState<ReporteCasos | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [abogadoId, setAbogadoId] = useState("");
  const [estatus, setEstatus] = useState("");

  function load() {
    setLoading(true);
    getReporteCasos({
      desde: desde ? new Date(desde).toISOString() : null,
      hasta: hasta ? new Date(hasta).toISOString() : null,
      abogadoResponsableId: abogadoId ? Number(abogadoId) : null,
      estatus: (estatus as EstatusCaso) || null,
    })
      .then(setReporte)
      .catch(() => setError("No se pudo generar el reporte."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    getUsuarios().then(setUsuarios).catch(() => undefined);
  }, []);

  function handleExportarCsv() {
    if (!reporte) return;
    const encabezados = ["Folio", "Cliente", "Tipo", "Estatus", "Abogado", "Fecha apertura"];
    const filas = reporte.casos.map((c) => [
      c.folioInterno ?? "",
      c.clienteNombre,
      c.tipo,
      c.estatus,
      c.abogadoResponsableNombre ?? "",
      new Date(c.fechaApertura).toLocaleDateString("es-MX"),
    ]);
    const csv = [encabezados, ...filas].map((fila) => fila.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-casos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Panorama del despacho</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Reportes</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Casos por cliente, abogado, tipo de asunto, estado y periodo.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 border border-brand-line bg-brand-ink2 p-6 sm:grid-cols-5">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="mt-1 w-full border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="mt-1 w-full border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Abogado</label>
          <select value={abogadoId} onChange={(e) => setAbogadoId(e.target.value)} className="mt-1 w-full border border-brand-line bg-brand-ink px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold">
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Estatus</label>
          <select value={estatus} onChange={(e) => setEstatus(e.target.value)} className="mt-1 w-full border border-brand-line bg-brand-ink px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold">
            <option value="">Todos</option>
            {ESTATUSES.map((s) => (
              <option key={s} value={s}>{s === "Revision" ? "En revisión" : s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={load} className="w-full border border-brand-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink">
            Filtrar
          </button>
        </div>
      </div>

      {error && <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>}
      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Generando reporte…</p>}

      {!loading && reporte && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ResumenCard titulo="Total de casos" valor={reporte.totalCasos} />
            <DesgloseCard titulo="Por estatus" datos={reporte.porEstatus} />
            <DesgloseCard titulo="Por abogado" datos={reporte.porAbogado} />
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleExportarCsv} className="border border-brand-line px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
              Exportar a Excel/CSV
            </button>
          </div>

          <div className="mt-4 overflow-x-auto border border-brand-line">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1fr_2fr_2fr_1fr_1.5fr] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                <span>Folio</span>
                <span>Cliente</span>
                <span>Tipo</span>
                <span>Estatus</span>
                <span>Abogado</span>
              </div>
              {reporte.casos.map((c) => (
                <div key={c.id} className="grid grid-cols-[1fr_2fr_2fr_1fr_1.5fr] items-center gap-4 border-b border-brand-line px-5 py-3 text-sm text-brand-cream last:border-b-0">
                  <span className="text-brand-creamSoft">{c.folioInterno ?? "—"}</span>
                  <span>{c.clienteNombre}</span>
                  <span className="text-brand-creamSoft">{c.tipo}</span>
                  <span className="text-brand-creamSoft">{c.estatus}</span>
                  <span className="text-brand-creamSoft">{c.abogadoResponsableNombre ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResumenCard({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="border border-brand-line bg-brand-ink2 p-6">
      <p className="text-[11px] uppercase tracking-widest text-brand-creamSoft">{titulo}</p>
      <p className="mt-2 font-display text-3xl font-bold text-brand-gold">{valor}</p>
    </div>
  );
}

function DesgloseCard({ titulo, datos }: { titulo: string; datos: Record<string, number> }) {
  const entradas = Object.entries(datos);
  return (
    <div className="border border-brand-line bg-brand-ink2 p-6">
      <p className="text-[11px] uppercase tracking-widest text-brand-creamSoft">{titulo}</p>
      <ul className="mt-2 space-y-1">
        {entradas.length === 0 && <li className="text-sm text-brand-creamSoft">Sin datos.</li>}
        {entradas.map(([clave, valor]) => (
          <li key={clave} className="flex justify-between text-sm text-brand-cream">
            <span className="text-brand-creamSoft">{clave}</span>
            <span>{valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
