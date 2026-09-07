"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Monogram from "@/components/Monogram";
import StatusPill from "@/components/StatusPill";
import { IconFile, IconUpload } from "@/components/icons";
import { getCasoPorToken, subirDocumentoPortal, type PortalCaso } from "@/lib/api";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PortalClientePage() {
  const params = useParams<{ token: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caso, setCaso] = useState<PortalCaso | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getCasoPorToken(params.token)
      .then(setCaso)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.token]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await subirDocumentoPortal(params.token, file);
      load();
    } catch {
      setError("No se pudo subir el archivo. Intenta de nuevo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-brand-ink px-4 py-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <Monogram size={48} />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-wide text-brand-cream">
            EC ABOGADOS
          </h1>
          <p className="mt-1 font-script text-sm italic text-brand-gold">
            Seguimiento de tu expediente
          </p>
        </div>

        {loading && (
          <p className="mt-10 text-center text-sm text-brand-creamSoft">Cargando…</p>
        )}

        {!loading && notFound && (
          <p className="mt-10 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-center text-sm text-brand-gold">
            No encontramos este expediente. Verifica el enlace o contáctanos por WhatsApp.
          </p>
        )}

        {!loading && caso && (
          <div className="mt-10 space-y-6">
            <div className="border border-brand-line bg-brand-ink2 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-brand-cream">{caso.clienteNombre}</p>
                  <p className="text-xs uppercase tracking-widest text-brand-creamSoft">{caso.tipo}</p>
                </div>
                <StatusPill estatus={caso.estatus} />
              </div>
              <p className="mt-3 text-xs text-brand-creamSoft">
                Caso abierto el {new Date(caso.fechaApertura).toLocaleDateString("es-MX")}
              </p>
            </div>

            {caso.checklist.length > 0 && (
              <div className="border border-brand-line bg-brand-ink2 p-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                  Requisitos
                </h2>
                <ul className="mt-4 space-y-2">
                  {caso.checklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm">
                      <span
                        className={`flex h-4 w-4 items-center justify-center border text-[10px] ${
                          item.completado
                            ? "border-brand-gold bg-brand-gold text-brand-ink"
                            : "border-brand-line text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={item.completado ? "text-brand-creamSoft line-through" : "text-brand-cream"}>
                        {item.descripcion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border border-brand-line bg-brand-ink2 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                  Documentos
                </h2>
                <label className="flex cursor-pointer items-center gap-2 border border-brand-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink">
                  <IconUpload className="h-4 w-4" />
                  {uploading ? "Subiendo…" : "Subir"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {error && <p className="mt-3 text-xs text-brand-gold">{error}</p>}

              <ul className="mt-4 space-y-2">
                {caso.documentos.length === 0 && (
                  <li className="text-sm text-brand-creamSoft">Aún no hay documentos.</li>
                )}
                {caso.documentos.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 border border-brand-line px-4 py-3">
                    <IconFile className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-sm text-brand-cream">{d.nombreArchivo}</p>
                      <p className="text-xs text-brand-creamSoft">{formatBytes(d.tamanoBytes)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-center text-xs text-brand-creamSoft">
              ¿Dudas sobre tu caso? Escríbenos por WhatsApp y con gusto te apoyamos.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
