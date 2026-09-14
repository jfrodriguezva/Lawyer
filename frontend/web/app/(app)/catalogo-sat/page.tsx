"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarFlag,
  actualizarTramiteCatalogo,
  cambiarEstatusTramiteCatalogo,
  crearTramiteCatalogo,
  getCatalogoSAT,
  getFlags,
  type CatalogoTramiteSAT,
  type Flags,
} from "@/lib/api";

export default function CatalogoSATPage() {
  const [catalogo, setCatalogo] = useState<CatalogoTramiteSAT[]>([]);
  const [flags, setFlags] = useState<Flags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingFlag, setTogglingFlag] = useState(false);

  const [nombre, setNombre] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [etapas, setEtapas] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    getCatalogoSAT()
      .then(setCatalogo)
      .catch(() => setError("No se pudo cargar el catálogo."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    getFlags().then(setFlags).catch(() => undefined);
  }, []);

  async function handleToggleSat() {
    if (!flags) return;
    setTogglingFlag(true);
    try {
      const nuevoValor = !flags.satHabilitado;
      await actualizarFlag("sat_habilitado", nuevoValor);
      setFlags({ ...flags, satHabilitado: nuevoValor });
    } catch {
      setError("No se pudo actualizar el interruptor del módulo SAT.");
    } finally {
      setTogglingFlag(false);
    }
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setNombre("");
    setRequisitos("");
    setEtapas("");
    setObservaciones("");
  }

  function handleEditar(t: CatalogoTramiteSAT) {
    setEditandoId(t.id);
    setNombre(t.nombre);
    setRequisitos(t.requisitos ?? "");
    setEtapas(t.etapas ?? "");
    setObservaciones(t.observaciones ?? "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = { nombre, requisitos: requisitos || null, etapas: etapas || null, observaciones: observaciones || null };
      if (editandoId) {
        await actualizarTramiteCatalogo(editandoId, data);
      } else {
        await crearTramiteCatalogo(data);
      }
      limpiarFormulario();
      load();
    } catch {
      setError("No se pudo guardar el trámite del catálogo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActivo(t: CatalogoTramiteSAT) {
    try {
      await cambiarEstatusTramiteCatalogo(t.id, !t.activo);
      setCatalogo((prev) => prev.map((x) => (x.id === t.id ? { ...x, activo: !t.activo } : x)));
    } catch {
      setError("No se pudo actualizar el trámite.");
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Módulo informativo, no oficial del SAT</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Catálogo de trámites SAT</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-creamSoft">
        Este catálogo lo captura el despacho manualmente. El sistema nunca guarda contraseñas del SAT ni e.firma, y no
        se presenta como un servicio oficial del SAT.
      </p>

      {flags && (
        <div className="mt-6 flex items-center justify-between border border-brand-line bg-brand-ink2 px-5 py-4">
          <div>
            <p className="text-sm text-brand-cream">Módulo SAT visible para clientes y rol Consultor</p>
            <p className="text-xs text-brand-creamSoft">
              {flags.satHabilitado ? "Activado" : "Desactivado"} — actívalo cuando el catálogo esté listo.
            </p>
          </div>
          <button
            onClick={handleToggleSat}
            disabled={togglingFlag}
            className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
              flags.satHabilitado ? "border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-ink" : "border-brand-line text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            {flags.satHabilitado ? "Desactivar" : "Activar"}
          </button>
        </div>
      )}

      {error && <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 border border-brand-line bg-brand-ink2 p-6">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Nombre del trámite</label>
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Requisitos</label>
          <textarea rows={3} value={requisitos} onChange={(e) => setRequisitos(e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Etapas</label>
          <textarea rows={3} value={etapas} onChange={(e) => setEtapas(e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Observaciones</label>
          <textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60">
            {saving ? "Guardando…" : editandoId ? "Guardar cambios" : "Agregar trámite"}
          </button>
          {editandoId && (
            <button type="button" onClick={limpiarFormulario} className="border border-brand-line px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-creamSoft hover:border-brand-goldDeep">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando…</p>}
      {!loading && catalogo.length === 0 && <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay trámites en el catálogo.</p>}

      <div className="mt-8 space-y-3">
        {catalogo.map((t) => (
          <div key={t.id} className={`border px-5 py-4 ${t.activo ? "border-brand-line bg-brand-ink2" : "border-brand-line bg-brand-ink2/60 opacity-60"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm font-medium text-brand-cream">{t.nombre}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEditar(t)} className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
                  Editar
                </button>
                <button onClick={() => handleToggleActivo(t)} className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
                  {t.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
            {t.requisitos && <p className="mt-2 text-xs text-brand-creamSoft"><span className="text-brand-gold">Requisitos:</span> {t.requisitos}</p>}
            {t.etapas && <p className="mt-1 text-xs text-brand-creamSoft"><span className="text-brand-gold">Etapas:</span> {t.etapas}</p>}
            {t.observaciones && <p className="mt-1 text-xs text-brand-creamSoft"><span className="text-brand-gold">Observaciones:</span> {t.observaciones}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
