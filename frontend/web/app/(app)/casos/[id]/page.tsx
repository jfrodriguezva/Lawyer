"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusPill from "@/components/StatusPill";
import { IconFile, IconUpload } from "@/components/icons";
import { getCookie } from "@/lib/cookies";
import {
  cambiarEstatusCaso,
  crearActualizacionCaso,
  crearPlazo,
  crearTarea,
  descargarDocumento,
  getActualizacionesCaso,
  getAuditoriaPorCaso,
  getCaso,
  getClientes,
  getDocumentosPorCaso,
  getPagosPorCaso,
  getPlazosPorCaso,
  getUsuarios,
  marcarChecklistItem,
  marcarPlazoCumplido,
  marcarTareaCompletada,
  registrarPago,
  regenerarTokenCaso,
  subirDocumento,
  updateCaso,
  vincularClienteACaso,
  type ActualizacionCaso,
  type AuditoriaEntry,
  type CasoDetalle,
  type Cliente,
  type Documento,
  type EstatusCaso,
  type Pago,
  type Plazo,
  type TipoPago,
  type Usuario,
  type VisibilidadActualizacion,
  type VisibilidadDocumento,
} from "@/lib/api";

const ESTATUSES: EstatusCaso[] = ["Activo", "Revision", "Cerrado"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMoney(monto: number): string {
  return monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function CasoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caso, setCaso] = useState<CasoDetalle | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [plazos, setPlazos] = useState<Plazo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [auditoria, setAuditoria] = useState<AuditoriaEntry[]>([]);
  const [actualizaciones, setActualizaciones] = useState<ActualizacionCaso[]>([]);
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [visibilidadSubida, setVisibilidadSubida] = useState<VisibilidadDocumento>("Interno");
  const [copiado, setCopiado] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [vinculando, setVinculando] = useState(false);

  const [textoActualizacion, setTextoActualizacion] = useState("");
  const [visibilidadActualizacion, setVisibilidadActualizacion] = useState<VisibilidadActualizacion>("Interna");
  const [savingActualizacion, setSavingActualizacion] = useState(false);

  const [editandoDatos, setEditandoDatos] = useState(false);
  const [prioridad, setPrioridad] = useState("");
  const [folioInterno, setFolioInterno] = useState("");
  const [montoAcordado, setMontoAcordado] = useState("");
  const [savingDatos, setSavingDatos] = useState(false);

  const esModuloJuridico = rol === "Abogado" || rol === "Administrador";

  const [plazoDescripcion, setPlazoDescripcion] = useState("");
  const [plazoFecha, setPlazoFecha] = useState("");
  const [savingPlazo, setSavingPlazo] = useState(false);

  const [pagoConcepto, setPagoConcepto] = useState("");
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoTipo, setPagoTipo] = useState<TipoPago>("Pago");
  const [savingPago, setSavingPago] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tareaDescripcion, setTareaDescripcion] = useState("");
  const [tareaFecha, setTareaFecha] = useState("");
  const [tareaResponsableId, setTareaResponsableId] = useState("");
  const [savingTarea, setSavingTarea] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      getCaso(params.id),
      getDocumentosPorCaso(params.id),
      getPlazosPorCaso(params.id),
      getActualizacionesCaso(params.id),
    ])
      .then(([c, docs, pl, act]) => {
        setCaso(c);
        setDocumentos(docs);
        setPlazos(pl);
        setActualizaciones(act);
        setPrioridad(c.prioridad ?? "");
        setFolioInterno(c.folioInterno ?? "");
        setMontoAcordado(c.montoAcordado != null ? String(c.montoAcordado) : "");
      })
      .catch(() => setError("No se pudo cargar el expediente."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        const rolActual = JSON.parse(raw).rol ?? null;
        setRol(rolActual);
        if (rolActual === "Abogado" || rolActual === "Administrador") {
          getPagosPorCaso(params.id)
            .then(setPagos)
            .catch(() => undefined);
          getAuditoriaPorCaso(params.id)
            .then(setAuditoria)
            .catch(() => undefined);
          getClientes()
            .then(setClientes)
            .catch(() => undefined);
          getUsuarios()
            .then(setUsuarios)
            .catch(() => undefined);
        }
      } catch {
        // ignore malformed cookie
      }
    }
  }, [params.id]);

  async function handleEstatusChange(estatus: EstatusCaso) {
    if (!caso) return;
    let motivo: string | undefined;
    if (estatus === "Cerrado") {
      motivo = window.prompt("Motivo de cierre del expediente:") ?? undefined;
      if (!motivo) return;
    }
    setUpdatingEstatus(true);
    try {
      await cambiarEstatusCaso(caso.id, estatus, motivo);
      setCaso({ ...caso, estatus });
    } catch {
      setError("No se pudo actualizar el estatus.");
    } finally {
      setUpdatingEstatus(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !caso) return;
    setUploading(true);
    try {
      await subirDocumento(caso.id, file, { visibilidad: visibilidadSubida });
      const docs = await getDocumentosPorCaso(caso.id);
      setDocumentos(docs);
    } catch {
      setError("No se pudo subir el documento.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDescargar(doc: Documento) {
    try {
      await descargarDocumento(doc.id, doc.nombreArchivo);
    } catch {
      setError("No se pudo descargar el documento.");
    }
  }

  async function handleCrearActualizacion(e: FormEvent) {
    e.preventDefault();
    if (!caso || !textoActualizacion.trim()) return;
    setSavingActualizacion(true);
    try {
      await crearActualizacionCaso(caso.id, textoActualizacion, visibilidadActualizacion);
      setTextoActualizacion("");
      const act = await getActualizacionesCaso(caso.id);
      setActualizaciones(act);
    } catch {
      setError("No se pudo guardar la actualización.");
    } finally {
      setSavingActualizacion(false);
    }
  }

  async function handleGuardarDatos() {
    if (!caso) return;
    setSavingDatos(true);
    try {
      const monto = montoAcordado ? Number(montoAcordado) : null;
      await updateCaso(caso.id, {
        clienteNombre: caso.clienteNombre,
        tipo: caso.tipo,
        notas: caso.notas,
        prioridad: prioridad || null,
        folioInterno: folioInterno || null,
        montoAcordado: monto,
      });
      setCaso({ ...caso, prioridad: prioridad || null, folioInterno: folioInterno || null, montoAcordado: monto });
      setEditandoDatos(false);
    } catch {
      setError("No se pudieron guardar los datos del expediente.");
    } finally {
      setSavingDatos(false);
    }
  }

  async function handleChecklistToggle(itemId: number, completado: boolean) {
    if (!caso) return;
    try {
      await marcarChecklistItem(itemId, completado);
      setCaso({
        ...caso,
        checklist: caso.checklist.map((c) => (c.id === itemId ? { ...c, completado } : c)),
      });
    } catch {
      setError("No se pudo actualizar el requisito.");
    }
  }

  async function handleCrearPlazo(e: FormEvent) {
    e.preventDefault();
    if (!caso) return;
    setSavingPlazo(true);
    try {
      await crearPlazo({
        casoId: caso.id,
        descripcion: plazoDescripcion,
        fechaLimite: new Date(plazoFecha).toISOString(),
      });
      setPlazoDescripcion("");
      setPlazoFecha("");
      const pl = await getPlazosPorCaso(caso.id);
      setPlazos(pl);
    } catch {
      setError("No se pudo agregar el plazo.");
    } finally {
      setSavingPlazo(false);
    }
  }

  async function handlePlazoCumplido(id: number, cumplido: boolean) {
    try {
      await marcarPlazoCumplido(id, cumplido);
      setPlazos((prev) => prev.map((p) => (p.id === id ? { ...p, cumplido } : p)));
    } catch {
      setError("No se pudo actualizar el plazo.");
    }
  }

  async function handleRegistrarPago(e: FormEvent) {
    e.preventDefault();
    if (!caso) return;
    setSavingPago(true);
    try {
      await registrarPago({ casoId: caso.id, concepto: pagoConcepto, monto: Number(pagoMonto), tipo: pagoTipo });
      setPagoConcepto("");
      setPagoMonto("");
      const p = await getPagosPorCaso(caso.id);
      setPagos(p);
    } catch {
      setError("No se pudo registrar el pago.");
    } finally {
      setSavingPago(false);
    }
  }

  async function handleCrearTarea(e: FormEvent) {
    e.preventDefault();
    if (!caso || !tareaDescripcion.trim()) return;
    setSavingTarea(true);
    try {
      await crearTarea({
        casoId: caso.id,
        descripcion: tareaDescripcion,
        responsableUsuarioId: tareaResponsableId ? Number(tareaResponsableId) : null,
        fechaVencimiento: tareaFecha ? new Date(tareaFecha).toISOString() : null,
      });
      setTareaDescripcion("");
      setTareaFecha("");
      setTareaResponsableId("");
      const c = await getCaso(caso.id);
      setCaso(c);
    } catch {
      setError("No se pudo agregar la tarea.");
    } finally {
      setSavingTarea(false);
    }
  }

  async function handleTareaCompletada(id: number, completada: boolean) {
    if (!caso) return;
    try {
      await marcarTareaCompletada(id, completada);
      setCaso({ ...caso, tareas: caso.tareas.map((t) => (t.id === id ? { ...t, completada } : t)) });
    } catch {
      setError("No se pudo actualizar la tarea.");
    }
  }

  function handleImprimirRecibo(pago: Pago) {
    if (!caso || typeof window === "undefined") return;
    const ventana = window.open("", "_blank", "width=480,height=640");
    if (!ventana) return;
    ventana.document.write(`
      <html>
        <head><title>Comprobante interno</title></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>ECGAbogados</h2>
          <p style="color:#7c3a3a;font-size:12px;">Comprobante interno — no es un comprobante fiscal digital (CFDI).</p>
          <hr />
          <p><strong>Cliente:</strong> ${caso.clienteNombre}</p>
          <p><strong>Expediente:</strong> ${caso.tipo}${caso.folioInterno ? ` (${caso.folioInterno})` : ""}</p>
          <p><strong>Concepto:</strong> ${pago.concepto}</p>
          <p><strong>Tipo:</strong> ${pago.tipo}</p>
          <p><strong>Monto:</strong> ${formatMoney(pago.monto)}</p>
          <p><strong>Fecha:</strong> ${new Date(pago.fecha).toLocaleDateString("es-MX")}</p>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  }

  function handleCopiarLink() {
    if (!caso?.tokenAcceso || typeof window === "undefined") return;
    const url = `${window.location.origin}/portal/${caso.tokenAcceso}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  async function handleRegenerarLink() {
    if (!caso) return;
    if (!window.confirm("El enlace anterior dejará de funcionar de inmediato. ¿Continuar?")) return;
    setRegenerando(true);
    try {
      const { token } = await regenerarTokenCaso(caso.id);
      setCaso({ ...caso, tokenAcceso: token, tokenGeneradoEn: new Date().toISOString() });
    } catch {
      setError("No se pudo regenerar el enlace.");
    } finally {
      setRegenerando(false);
    }
  }

  async function handleVincularCliente() {
    if (!caso || !clienteSeleccionado) return;
    setVinculando(true);
    try {
      const clienteId = Number(clienteSeleccionado);
      await vincularClienteACaso(caso.id, clienteId);
      const cliente = clientes.find((c) => c.id === clienteId);
      setCaso({
        ...caso,
        clienteVinculadoId: clienteId,
        clienteVinculadoNombre: cliente?.nombre ?? null,
        clienteVinculadoEmail: cliente?.email ?? null,
      });
    } catch {
      setError("No se pudo vincular la cuenta de cliente.");
    } finally {
      setVinculando(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-creamSoft">Cargando expediente…</p>;
  }

  if (!caso) {
    return (
      <div>
        <p className="border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error ?? "Expediente no encontrado."}
        </p>
        <button
          onClick={() => router.push("/casos")}
          className="mt-4 text-xs uppercase tracking-widest text-brand-gold hover:underline"
        >
          Volver a expedientes
        </button>
      </div>
    );
  }

  const totalCobrado = pagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div>
      <button
        onClick={() => router.push("/casos")}
        className="text-xs uppercase tracking-widest text-brand-creamSoft hover:text-brand-gold"
      >
        ← Expedientes
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-cream">
            {caso.clienteNombre}
          </h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-brand-creamSoft">
            {caso.tipo}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-creamSoft">
            {caso.folioInterno && <span>Folio: {caso.folioInterno}</span>}
            {caso.prioridad && <span>Prioridad: {caso.prioridad}</span>}
            {caso.abogadoResponsableNombre && <span>Responsable: {caso.abogadoResponsableNombre}</span>}
            {esModuloJuridico && (
              <button onClick={() => setEditandoDatos((v) => !v)} className="text-brand-gold hover:underline">
                {editandoDatos ? "Cancelar" : "Editar"}
              </button>
            )}
          </div>
          {editandoDatos && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Prioridad</label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="mt-1 border border-brand-line bg-brand-ink px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
                >
                  <option value="">Sin definir</option>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Folio interno</label>
                <input
                  value={folioInterno}
                  onChange={(e) => setFolioInterno(e.target.value)}
                  className="mt-1 border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-brand-creamSoft">Monto acordado</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoAcordado}
                  onChange={(e) => setMontoAcordado(e.target.value)}
                  className="mt-1 border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>
              <button
                onClick={handleGuardarDatos}
                disabled={savingDatos}
                className="border border-brand-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
              >
                {savingDatos ? "Guardando…" : "Guardar"}
              </button>
            </div>
          )}
        </div>
        <StatusPill estatus={caso.estatus} />
      </div>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-8">
          <div className="border border-brand-line bg-brand-ink2 p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Notas del caso
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-cream">
              {caso.notas || "Sin notas registradas."}
            </p>
          </div>

          <div className="border border-brand-line bg-brand-ink2 p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Actualizaciones del caso
            </h2>
            <p className="mt-1 text-[11px] text-brand-creamSoft">
              Las <span className="text-brand-gold">compartidas</span> las ve el cliente en su portal; las internas nunca.
            </p>
            <form onSubmit={handleCrearActualizacion} className="mt-4 space-y-3">
              <textarea
                rows={2}
                value={textoActualizacion}
                onChange={(e) => setTextoActualizacion(e.target.value)}
                placeholder="Escribe un avance…"
                className="w-full border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
              />
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={visibilidadActualizacion}
                  onChange={(e) => setVisibilidadActualizacion(e.target.value as VisibilidadActualizacion)}
                  className="border border-brand-line bg-brand-ink px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
                >
                  <option value="Interna">Interna (solo despacho)</option>
                  <option value="Compartida">Compartida (visible al cliente)</option>
                </select>
                <button
                  type="submit"
                  disabled={savingActualizacion || !textoActualizacion.trim()}
                  className="border border-brand-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
                >
                  {savingActualizacion ? "Guardando…" : "Agregar"}
                </button>
              </div>
            </form>
            <ul className="mt-4 space-y-2">
              {actualizaciones.length === 0 && (
                <li className="text-sm text-brand-creamSoft">Sin actualizaciones registradas.</li>
              )}
              {actualizaciones.map((a) => (
                <li key={a.id} className="border border-brand-line px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-widest ${
                        a.visibilidad === "Compartida" ? "text-brand-gold" : "text-brand-creamSoft"
                      }`}
                    >
                      {a.visibilidad === "Compartida" ? "Compartida con el cliente" : "Interna"}
                    </span>
                    <span className="text-xs text-brand-creamSoft">
                      {new Date(a.fecha).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brand-cream">{a.texto}</p>
                  {a.usuarioNombre && <p className="mt-1 text-xs text-brand-creamSoft">{a.usuarioNombre}</p>}
                </li>
              ))}
            </ul>
          </div>

          {caso.checklist.length > 0 && (
            <div className="border border-brand-line bg-brand-ink2 p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Checklist de requisitos
              </h2>
              <ul className="mt-4 space-y-2">
                {caso.checklist.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completado}
                        onChange={(e) => handleChecklistToggle(item.id, e.target.checked)}
                        className="h-4 w-4 accent-[var(--brand-gold,#c9a24a)]"
                      />
                      <span
                        className={`text-sm ${
                          item.completado ? "text-brand-creamSoft line-through" : "text-brand-cream"
                        }`}
                      >
                        {item.descripcion}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line pb-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Documentos
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={visibilidadSubida}
                  onChange={(e) => setVisibilidadSubida(e.target.value as VisibilidadDocumento)}
                  className="border border-brand-line bg-brand-ink px-2 py-2 text-[11px] text-brand-cream outline-none focus:border-brand-gold"
                >
                  <option value="Interno">Interno</option>
                  <option value="Compartido">Compartido con el cliente</option>
                </select>
                <label className="flex cursor-pointer items-center gap-2 border border-brand-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink">
                  <IconUpload className="h-4 w-4" />
                  {uploading ? "Subiendo…" : "Subir documento"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {documentos.length === 0 && (
                <li className="text-sm text-brand-creamSoft">Sin documentos cargados.</li>
              )}
              {documentos.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-brand-line px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <IconFile className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-sm text-brand-cream">{d.nombreArchivo}</p>
                      <p className="text-xs text-brand-creamSoft">
                        {formatBytes(d.tamanoBytes)} ·{" "}
                        {new Date(d.fechaCarga).toLocaleDateString("es-MX")} ·{" "}
                        {d.visibilidad === "Compartido"
                          ? "Compartido"
                          : d.visibilidad === "SubidoPorCliente"
                            ? "Subido por el cliente"
                            : "Interno"}{" "}
                        · {d.estatus}
                      </p>
                    </div>
                  </div>
                  {!d.soloRegistro && (
                    <button
                      onClick={() => handleDescargar(d)}
                      className="border border-brand-line px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
                    >
                      Descargar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="border-b border-brand-line pb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Plazos y audiencias
            </h2>
            <form onSubmit={handleCrearPlazo} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto]">
              <input
                required
                placeholder="Descripción (ej. Audiencia preliminar)"
                value={plazoDescripcion}
                onChange={(e) => setPlazoDescripcion(e.target.value)}
                className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
              />
              <input
                required
                type="date"
                value={plazoFecha}
                onChange={(e) => setPlazoFecha(e.target.value)}
                className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
              />
              <button
                type="submit"
                disabled={savingPlazo}
                className="border border-brand-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
              >
                {savingPlazo ? "Agregando…" : "Agregar"}
              </button>
            </form>
            <ul className="mt-4 space-y-2">
              {plazos.length === 0 && (
                <li className="text-sm text-brand-creamSoft">Sin plazos registrados.</li>
              )}
              {plazos.map((p) => {
                const vencido = !p.cumplido && new Date(p.fechaLimite) < new Date();
                return (
                  <li
                    key={p.id}
                    className={`flex items-center justify-between border px-4 py-3 ${
                      vencido ? "border-red-500/50 bg-red-500/10" : "border-brand-line"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={p.cumplido}
                        onChange={(e) => handlePlazoCumplido(p.id, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <div>
                        <p
                          className={`text-sm ${
                            p.cumplido ? "text-brand-creamSoft line-through" : "text-brand-cream"
                          }`}
                        >
                          {p.descripcion}
                        </p>
                        <p className={`text-xs ${vencido ? "text-red-400" : "text-brand-creamSoft"}`}>
                          {new Date(p.fechaLimite).toLocaleDateString("es-MX")}
                          {vencido ? " · vencido" : ""}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {esModuloJuridico && (
            <div>
              <h2 className="border-b border-brand-line pb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Tareas
              </h2>
              <form onSubmit={handleCrearTarea} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <input
                  required
                  placeholder="Descripción de la tarea"
                  value={tareaDescripcion}
                  onChange={(e) => setTareaDescripcion(e.target.value)}
                  className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
                <select
                  value={tareaResponsableId}
                  onChange={(e) => setTareaResponsableId(e.target.value)}
                  className="border border-brand-line bg-brand-ink px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                >
                  <option value="">Sin asignar</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={tareaFecha}
                  onChange={(e) => setTareaFecha(e.target.value)}
                  className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
                <button
                  type="submit"
                  disabled={savingTarea}
                  className="border border-brand-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
                >
                  {savingTarea ? "Agregando…" : "Agregar"}
                </button>
              </form>
              <ul className="mt-4 space-y-2">
                {caso.tareas.length === 0 && (
                  <li className="text-sm text-brand-creamSoft">Sin tareas registradas.</li>
                )}
                {caso.tareas.map((t) => {
                  const vencida = !t.completada && t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date();
                  return (
                    <li
                      key={t.id}
                      className={`flex items-center justify-between border px-4 py-3 ${
                        vencida ? "border-red-500/50 bg-red-500/10" : "border-brand-line"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={t.completada}
                          onChange={(e) => handleTareaCompletada(t.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className={`text-sm ${t.completada ? "text-brand-creamSoft line-through" : "text-brand-cream"}`}>
                            {t.descripcion}
                          </p>
                          <p className={`text-xs ${vencida ? "text-red-400" : "text-brand-creamSoft"}`}>
                            {t.responsableNombre ?? "Sin asignar"}
                            {t.fechaVencimiento && ` · ${new Date(t.fechaVencimiento).toLocaleDateString("es-MX")}`}
                            {vencida ? " · vencida" : ""}
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {esModuloJuridico && (
            <div>
              <h2 className="border-b border-brand-line pb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Honorarios
              </h2>
              {caso.montoAcordado != null && (
                <p className="mt-3 text-xs text-brand-creamSoft">
                  Monto acordado: <span className="text-brand-cream">{formatMoney(caso.montoAcordado)}</span>
                  {" · "}Saldo: <span className={totalCobrado >= caso.montoAcordado ? "text-brand-gold" : "text-brand-cream"}>
                    {formatMoney(Math.max(caso.montoAcordado - totalCobrado, 0))}
                  </span>
                </p>
              )}
              <form onSubmit={handleRegistrarPago} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <input
                  required
                  placeholder="Concepto"
                  value={pagoConcepto}
                  onChange={(e) => setPagoConcepto(e.target.value)}
                  className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
                <select
                  value={pagoTipo}
                  onChange={(e) => setPagoTipo(e.target.value as TipoPago)}
                  className="border border-brand-line bg-brand-ink px-3 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                >
                  <option value="Anticipo">Anticipo</option>
                  <option value="Pago">Pago</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Monto"
                  value={pagoMonto}
                  onChange={(e) => setPagoMonto(e.target.value)}
                  className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
                <button
                  type="submit"
                  disabled={savingPago}
                  className="border border-brand-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
                >
                  {savingPago ? "Guardando…" : "Registrar"}
                </button>
              </form>
              <div className="mt-4 border border-brand-line">
                {pagos.length === 0 && (
                  <p className="px-4 py-3 text-sm text-brand-creamSoft">Sin pagos registrados.</p>
                )}
                {pagos.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="text-brand-cream">{p.concepto} <span className="text-brand-creamSoft">({p.tipo})</span></span>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-creamSoft">
                        {formatMoney(p.monto)} · {new Date(p.fecha).toLocaleDateString("es-MX")}
                      </span>
                      <button
                        onClick={() => handleImprimirRecibo(p)}
                        className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
                      >
                        Recibo
                      </button>
                    </div>
                  </div>
                ))}
                {pagos.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand-gold">
                    <span>Total cobrado</span>
                    <span>{formatMoney(totalCobrado)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {esModuloJuridico && auditoria.length > 0 && (
            <div>
              <h2 className="border-b border-brand-line pb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Historial
              </h2>
              <ul className="mt-4 space-y-2">
                {auditoria.map((entry) => (
                  <li key={entry.id} className="border border-brand-line px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-brand-cream">{entry.accion}</span>
                      <span className="text-xs text-brand-creamSoft">
                        {new Date(entry.fecha).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-creamSoft">
                      {entry.usuarioNombre ?? "Público (sin sesión)"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="border border-brand-line bg-brand-ink2 p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Estatus del expediente
            </h2>
            <p className="mt-2 text-xs text-brand-creamSoft">
              Apertura: {new Date(caso.fechaApertura).toLocaleDateString("es-MX")}
            </p>
            <select
              value={caso.estatus}
              disabled={updatingEstatus}
              onChange={(e) => handleEstatusChange(e.target.value as EstatusCaso)}
              className="mt-4 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
            >
              {ESTATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "Revision" ? "En revisión" : s}
                </option>
              ))}
            </select>
          </div>

          {caso.tokenAcceso && (
            <div className="border border-brand-line bg-brand-ink2 p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Portal del cliente
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-brand-creamSoft">
                Comparte este enlace por WhatsApp para que el cliente vea el estatus de su caso sin necesidad de cuenta.
              </p>
              {caso.tokenGeneradoEn && (
                <p className="mt-2 text-[11px] text-brand-creamSoft/70">
                  Generado el {new Date(caso.tokenGeneradoEn).toLocaleDateString("es-MX")} · vigente 180 días
                </p>
              )}
              <button
                onClick={handleCopiarLink}
                className="mt-4 w-full border border-brand-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink"
              >
                {copiado ? "¡Copiado!" : "Copiar enlace"}
              </button>
              {esModuloJuridico && (
                <button
                  onClick={handleRegenerarLink}
                  disabled={regenerando}
                  className="mt-2 w-full border border-brand-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-goldDeep hover:text-brand-goldDeep disabled:opacity-60"
                >
                  {regenerando ? "Regenerando…" : "Regenerar enlace"}
                </button>
              )}
            </div>
          )}

          {esModuloJuridico && (
            <div className="border border-brand-line bg-brand-ink2 p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Cuenta de cliente
              </h2>
              {caso.clienteVinculadoId ? (
                <>
                  <p className="mt-2 text-sm text-brand-cream">{caso.clienteVinculadoNombre}</p>
                  <p className="text-xs text-brand-creamSoft">{caso.clienteVinculadoEmail}</p>
                  <p className="mt-3 text-[11px] leading-relaxed text-brand-creamSoft">
                    Este cliente ve el estatus de este expediente al iniciar sesión en su portal.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-brand-creamSoft">
                    Vincula este expediente a una cuenta de cliente registrada para que pueda verlo en su portal (con
                    usuario y contraseña, en <code>/cliente/login</code>).
                  </p>
                  <select
                    value={clienteSeleccionado}
                    onChange={(e) => setClienteSeleccionado(e.target.value)}
                    className="mt-4 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                  >
                    <option value="">Selecciona un cliente…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleVincularCliente}
                    disabled={!clienteSeleccionado || vinculando}
                    className="mt-2 w-full border border-brand-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {vinculando ? "Vinculando…" : "Vincular"}
                  </button>
                  {clientes.length === 0 && (
                    <p className="mt-2 text-[11px] text-brand-creamSoft">
                      Aún no hay clientes registrados — créalos en la sección &quot;Clientes&quot;.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
