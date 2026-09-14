"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarTramiteSAT,
  crearTramiteSAT,
  getCatalogoSAT,
  getClientes,
  getDirectorioUsuarios,
  getTramitesSAT,
  type CatalogoTramiteSAT,
  type Cliente,
  type DirectorioUsuario,
  type EstatusTramiteSAT,
  type TramiteSAT,
} from "@/lib/api";

const ETIQUETA_ESTATUS: Record<EstatusTramiteSAT, string> = {
  Pendiente: "Pendiente",
  EnProceso: "En proceso",
  EsperandoCliente: "Esperando al cliente",
  Completado: "Completado",
  Cancelado: "Cancelado",
};

export default function TramitesSATPage() {
  const [tramites, setTramites] = useState<TramiteSAT[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoTramiteSAT[]>([]);
  const [usuarios, setUsuarios] = useState<DirectorioUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [catalogoTramiteId, setCatalogoTramiteId] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [observaciones, setObservaciones] = useState("");

  function load() {
    setLoading(true);
    getTramitesSAT()
      .then(setTramites)
      .catch(() => setError("No se pudieron cargar los trámites. Verifica que el módulo SAT esté activo."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    getClientes().then(setClientes).catch(() => undefined);
    getCatalogoSAT().then(setCatalogo).catch(() => undefined);
    getDirectorioUsuarios().then(setUsuarios).catch(() => undefined);
  }, []);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    if (!clienteId || !catalogoTramiteId) return;
    setSaving(true);
    setError(null);
    try {
      await crearTramiteSAT({
        clienteId: Number(clienteId),
        catalogoTramiteId: Number(catalogoTramiteId),
        responsableUsuarioId: responsableId ? Number(responsableId) : null,
        fechaLimite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
        observaciones: observaciones || null,
      });
      setClienteId("");
      setCatalogoTramiteId("");
      setResponsableId("");
      setFechaLimite("");
      setObservaciones("");
      load();
    } catch {
      setError("No se pudo dar de alta el trámite.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCambiarEstatus(t: TramiteSAT, estatus: EstatusTramiteSAT) {
    try {
      await actualizarTramiteSAT(t.id, {
        estatus,
        responsableUsuarioId: t.responsableUsuarioId,
        fechaLimite: t.fechaLimite,
        observaciones: t.observaciones,
      });
      setTramites((prev) => prev.map((x) => (x.id === t.id ? { ...x, estatus } : x)));
    } catch {
      setError("No se pudo actualizar el trámite.");
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Seguimiento administrativo, no oficial del SAT</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Trámites SAT por cliente</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-creamSoft">
        Este módulo es exclusivamente informativo: nunca se solicitan ni almacenan contraseñas del SAT ni e.firma.
      </p>

      {error && <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>}

      <form onSubmit={handleCrear} className="mt-8 grid grid-cols-1 gap-3 border border-brand-line bg-brand-ink2 p-6 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Cliente</label>
          <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="mt-1 w-full border border-brand-line bg-brand-ink px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold">
            <option value="">Selecciona…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Trámite (catálogo)</label>
          <select required value={catalogoTramiteId} onChange={(e) => setCatalogoTramiteId(e.target.value)} className="mt-1 w-full border border-brand-line bg-brand-ink px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold">
            <option value="">Selecciona…</option>
            {catalogo.filter((c) => c.activo).map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Responsable</label>
          <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)} className="mt-1 w-full border border-brand-line bg-brand-ink px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold">
            <option value="">Sin asignar</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Fecha límite</label>
          <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} className="mt-1 w-full border border-brand-line bg-transparent px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Observaciones</label>
          <textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-1 w-full border border-brand-line bg-transparent px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60">
            {saving ? "Guardando…" : "Dar de alta"}
          </button>
        </div>
      </form>

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando…</p>}
      {!loading && tramites.length === 0 && <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay trámites registrados.</p>}

      <div className="mt-8 overflow-x-auto border border-brand-line">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            <span>Cliente</span>
            <span>Trámite</span>
            <span>Responsable</span>
            <span>Fecha límite</span>
            <span>Estatus</span>
          </div>
          {tramites.map((t) => (
            <div key={t.id} className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr] items-center gap-4 border-b border-brand-line px-5 py-3 text-sm text-brand-cream last:border-b-0">
              <span>{t.clienteNombre ?? "—"}</span>
              <span className="text-brand-creamSoft">{t.catalogoTramiteNombre ?? "—"}</span>
              <span className="text-brand-creamSoft">{t.responsableNombre ?? "Sin asignar"}</span>
              <span className="text-brand-creamSoft">{t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString("es-MX") : "—"}</span>
              <select
                value={t.estatus}
                onChange={(e) => handleCambiarEstatus(t, e.target.value as EstatusTramiteSAT)}
                className="border border-brand-line bg-brand-ink px-2 py-1.5 text-xs text-brand-cream outline-none focus:border-brand-gold"
              >
                {Object.entries(ETIQUETA_ESTATUS).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>{etiqueta}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
