"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProspectos, type EtapaProspecto, type Prospecto } from "@/lib/api";

const ETIQUETA_ETAPA: Record<EtapaProspecto, string> = {
  Nuevo: "Nuevo",
  EnRevision: "En revisión",
  EntrevistaRealizada: "Entrevista realizada",
  Contratado: "Contratado",
  NoContratado: "No contratado",
};

export default function ProspectosPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProspectos()
      .then(setProspectos)
      .catch(() => setError("No se pudieron cargar los prospectos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">De solicitud a contratación</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Prospectos</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Personas que solicitaron una cita y aún no son clientes. Registra el resultado de su entrevista y conviértelos cuando se concrete la contratación.
      </p>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando prospectos…</p>}

      {!loading && prospectos.length === 0 && (
        <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay prospectos registrados.</p>
      )}

      {!loading && prospectos.length > 0 && (
        <div className="mt-8 overflow-x-auto border border-brand-line">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_auto] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              <span>Nombre</span>
              <span>Contacto</span>
              <span>Servicio de interés</span>
              <span>Etapa</span>
              <span>Acciones</span>
            </div>
            {prospectos.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_2fr_1.5fr_1fr_auto] items-center gap-4 border-b border-brand-line px-5 py-4 text-sm text-brand-cream last:border-b-0"
              >
                <span className="font-medium">{p.nombre}</span>
                <span className="text-brand-creamSoft">
                  {p.telefono} · {p.email}
                </span>
                <span className="text-brand-creamSoft">{p.servicioInteres ?? "—"}</span>
                <span className={p.etapa === "Contratado" ? "text-brand-gold" : "text-brand-creamSoft"}>
                  {ETIQUETA_ETAPA[p.etapa]}
                </span>
                <Link
                  href={`/prospectos/${p.id}`}
                  className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
