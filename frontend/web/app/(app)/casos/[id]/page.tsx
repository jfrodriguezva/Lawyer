"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusPill from "@/components/StatusPill";
import { IconFile, IconUpload } from "@/components/icons";
import { getCookie } from "@/lib/cookies";
import {
  cambiarEstatusCaso,
  crearPlazo,
  getAuditoriaPorCaso,
  getCaso,
  getDocumentosPorCaso,
  getPagosPorCaso,
  getPlazosPorCaso,
  marcarChecklistItem,
  marcarPlazoCumplido,
  regenerarTokenCaso,
  registrarPago,
  subirDocumento,
  type AuditoriaEntry,
  type CasoDetalle,
  type Documento,
  type EstatusCaso,
  type Pago,
  type Plazo,
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [regenerando, setRegenerando] = useState(false);

  const [plazoDescripcion, setPlazoDescripcion] = useState("");
  const [plazoFecha, setPlazoFecha] = useState("");
  const [savingPlazo, setSavingPlazo] = useState(false);

  const [pagoConcepto, setPagoConcepto] = useState("");
  const [pagoMonto, setPagoMonto] = useState("");
  const [savingPago, setSavingPago] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      getCaso(params.id),
      getDocumentosPorCaso(params.id),
      getPlazosPorCaso(params.id),
    ])
      .then(([c, docs, pl]) => {
        setCaso(c);
        setDocumentos(docs);
        setPlazos(pl);
      })
      .catch(() => setError("No se pudo cargar el expediente."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        const admin = JSON.parse(raw).rol === "Administrador";
        setIsAdmin(admin);
        if (admin) {
          getPagosPorCaso(params.id)
            .then(setPagos)
            .catch(() => undefined);
          getAuditoriaPorCaso(params.id)
            .then(setAuditoria)
            .catch(() => undefined);
        }
      } catch {
        // ignore malformed cookie
      }
    }
  }, [params.id]);

  async function handleEstatusChange(estatus: EstatusCaso) {
    if (!caso) return;
    setUpdatingEstatus(true);
    try {
      await cambiarEstatusCaso(caso.id, estatus);
      setCaso({ ...caso, estatus });
    } catch {
      setError("No se pudo actualizar el estatus (cerrar un expediente requiere rol Administrador).");
    } finally {
      setUpdatingEstatus(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !caso) return;
    setUploading(true);
    try {
      await subirDocumento(caso.id, file);
      const docs = await getDocumentosPorCaso(caso.id);
      setDocumentos(docs);
    } catch {
      setError("No se pudo subir el documento.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      await registrarPago({ casoId: caso.id, concepto: pagoConcepto, monto: Number(pagoMonto) });
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
            <div className="flex items-center justify-between border-b border-brand-line pb-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Documentos
              </h2>
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
            <ul className="mt-4 space-y-2">
              {documentos.length === 0 && (
                <li className="text-sm text-brand-creamSoft">Sin documentos cargados.</li>
              )}
              {documentos.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between border border-brand-line px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <IconFile className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-sm text-brand-cream">{d.nombreArchivo}</p>
                      <p className="text-xs text-brand-creamSoft">
                        {formatBytes(d.tamanoBytes)} ·{" "}
                        {new Date(d.fechaCarga).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
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

          {isAdmin && (
            <div>
              <h2 className="border-b border-brand-line pb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Honorarios
              </h2>
              <form onSubmit={handleRegistrarPago} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto]">
                <input
                  required
                  placeholder="Concepto (ej. Anticipo)"
                  value={pagoConcepto}
                  onChange={(e) => setPagoConcepto(e.target.value)}
                  className="border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
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
                    className="flex items-center justify-between border-b border-brand-line px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="text-brand-cream">{p.concepto}</span>
                    <span className="text-brand-creamSoft">
                      {formatMoney(p.monto)} · {new Date(p.fecha).toLocaleDateString("es-MX")}
                    </span>
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

          {isAdmin && auditoria.length > 0 && (
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
            {!isAdmin && (
              <p className="mt-2 text-[11px] text-brand-creamSoft">
                Cerrar un expediente requiere rol Administrador.
              </p>
            )}
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
              {isAdmin && (
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
        </section>
      </div>
    </div>
  );
}
