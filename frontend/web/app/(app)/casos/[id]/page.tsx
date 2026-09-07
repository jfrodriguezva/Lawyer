"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusPill from "@/components/StatusPill";
import { IconFile, IconUpload } from "@/components/icons";
import {
  cambiarEstatusCaso,
  getCaso,
  getDocumentosPorCaso,
  subirDocumento,
  type Caso,
  type Documento,
  type EstatusCaso,
} from "@/lib/api";

const ESTATUSES: EstatusCaso[] = ["Activo", "Revision", "Cerrado"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CasoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caso, setCaso] = useState<Caso | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);
  const [uploading, setUploading] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getCaso(params.id), getDocumentosPorCaso(params.id)])
      .then(([c, docs]) => {
        setCaso(c);
        setDocumentos(docs);
      })
      .catch(() => setError("No se pudo cargar el expediente."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  async function handleEstatusChange(estatus: EstatusCaso) {
    if (!caso) return;
    setUpdatingEstatus(true);
    try {
      await cambiarEstatusCaso(caso.id, estatus);
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
        </section>

        <section className="border border-brand-line bg-brand-ink2 p-6">
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
        </section>
      </div>
    </div>
  );
}
