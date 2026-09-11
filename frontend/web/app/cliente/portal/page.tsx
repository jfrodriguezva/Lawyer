"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Monogram from "@/components/Monogram";
import StatusPill from "@/components/StatusPill";
import { IconFile, IconLogout } from "@/components/icons";
import { getMisCasos, type PortalCaso } from "@/lib/api";
import { deleteCookie, getCookie } from "@/lib/cookies";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClientePortalPage() {
  const router = useRouter();

  const [casos, setCasos] = useState<PortalCaso[]>([]);
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const raw = getCookie("ecg_cliente_user");
    if (raw) {
      try {
        setNombre(JSON.parse(raw).nombre ?? "");
      } catch {
        // ignore malformed cookie
      }
    }
  }, []);

  useEffect(() => {
    getMisCasos()
      .then((data) => {
        setCasos(data);
        setSeleccionadoId(data[0]?.id ?? null);
      })
      .catch(() => setError("No se pudieron cargar tus expedientes."))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    deleteCookie("ecg_cliente_token");
    deleteCookie("ecg_cliente_user");
    router.push("/cliente/login");
  }

  const caso = casos.find((c) => c.id === seleccionadoId) ?? null;

  return (
    <main className="min-h-screen bg-brand-ink px-4 py-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-center text-center">
            <Monogram size={48} />
            <h1 className="mt-4 font-display text-2xl font-bold tracking-wide text-brand-cream">
              Hola, {nombre || "bienvenido"}
            </h1>
            <p className="mt-1 font-script text-sm italic text-brand-gold">
              Seguimiento de tu(s) expediente(s)
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-brand-line px-3 py-1.5 text-[11px] uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            <IconLogout className="h-4 w-4" />
            Salir
          </button>
        </div>

        {loading && <p className="mt-10 text-center text-sm text-brand-creamSoft">Cargando…</p>}

        {error && (
          <p className="mt-10 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-center text-sm text-brand-gold">
            {error}
          </p>
        )}

        {!loading && !error && casos.length === 0 && (
          <p className="mt-10 text-center text-sm text-brand-creamSoft">
            Aún no tienes expedientes vinculados a tu cuenta. Contacta a tu abogada si crees que esto es un error.
          </p>
        )}

        {casos.length > 1 && (
          <div className="mt-8">
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Expediente
            </label>
            <select
              value={seleccionadoId ?? ""}
              onChange={(e) => setSeleccionadoId(Number(e.target.value))}
              className="mt-2 w-full border border-brand-line bg-brand-ink2 px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            >
              {casos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo} · {new Date(c.fechaApertura).toLocaleDateString("es-MX")}
                </option>
              ))}
            </select>
          </div>
        )}

        {!loading && caso && (
          <div className="mt-6 space-y-6">
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
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Documentos
              </h2>
              <p className="mt-2 text-xs text-brand-creamSoft">
                Aquí verás los documentos que tu abogada vaya cargando a tu expediente.
              </p>
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
