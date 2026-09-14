"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Monogram from "@/components/Monogram";
import { ApiError, getSolicitudPorToken, responderHorarioAlternativo, type SolicitudCitaPublica } from "@/lib/api";

const ETIQUETA_ESTATUS: Record<string, string> = {
  SolicitudRecibida: "Recibimos tu solicitud y está en revisión.",
  EnRevision: "Tu solicitud está en revisión.",
  InformacionRequerida: "El despacho necesita información adicional de tu parte.",
  HorarioAlternativoPropuesto: "El despacho propone un nuevo horario. Confirma o propón otro abajo.",
  PendienteConfirmacionSolicitante: "Estamos esperando tu confirmación.",
  Confirmada: "Tu cita quedó confirmada.",
  Realizada: "Esta cita ya se realizó.",
  Cancelada: "Esta solicitud fue cancelada.",
  NoAsistio: "Se registró que no asististe a esta cita.",
  Rechazada: "Esta solicitud fue rechazada.",
  ConvertidaEnContratacion: "Esta solicitud dio lugar a tu expediente. Consulta tu portal de cliente.",
};

export default function SolicitudPublicaPage() {
  const params = useParams<{ token: string }>();
  const [solicitud, setSolicitud] = useState<SolicitudCitaPublica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getSolicitudPorToken(params.token)
      .then(setSolicitud)
      .catch(() => setError("No encontramos esta solicitud. Verifica el enlace de tu correo."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-ink px-4 py-12">
      <div className="w-full max-w-lg border border-brand-line bg-brand-ink2 px-8 py-10 sm:px-10">
        <div className="flex flex-col items-center text-center">
          <Monogram size={56} />
          <h1 className="mt-5 font-display text-2xl font-bold tracking-wide text-brand-cream">
            Tu solicitud de cita
          </h1>
        </div>

        {loading && <p className="mt-8 text-center text-sm text-brand-creamSoft">Cargando…</p>}
        {error && (
          <p className="mt-8 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-center text-sm text-brand-gold">
            {error}
          </p>
        )}

        {!loading && solicitud && (
          <div className="mt-8 space-y-6">
            <p className="text-center text-sm text-brand-cream">{ETIQUETA_ESTATUS[solicitud.estatus] ?? solicitud.estatus}</p>

            <div className="border border-brand-line bg-brand-ink px-5 py-4 text-sm text-brand-creamSoft">
              <p>
                <span className="text-brand-cream">{solicitud.nombreSolicitante}</span> · {solicitud.modulo}
              </p>
              <p className="mt-1">
                {new Date(solicitud.fechaHoraPropuesta).toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {solicitud.modalidad}
              </p>
              {solicitud.motivo && <p className="mt-2">{solicitud.motivo}</p>}
            </div>

            {solicitud.estatus === "HorarioAlternativoPropuesto" && (
              <RespuestaHorario token={params.token} onRespondido={load} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function RespuestaHorario({ token, onRespondido }: { token: string; onRespondido: () => void }) {
  const [modo, setModo] = useState<"aceptar" | "otro" | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function aceptar() {
    setSaving(true);
    setError(null);
    try {
      await responderHorarioAlternativo(token, { respuesta: "AceptarHorario" });
      onRespondido();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo confirmar tu cita.");
    } finally {
      setSaving(false);
    }
  }

  async function proponerOtro() {
    if (!nuevaFecha) return;
    setSaving(true);
    setError(null);
    try {
      await responderHorarioAlternativo(token, {
        respuesta: "SolicitarOtroHorario",
        nuevaFechaHoraPropuesta: new Date(nuevaFecha).toISOString(),
      });
      onRespondido();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar tu propuesta.");
    } finally {
      setSaving(false);
    }
  }

  if (modo === "otro") {
    return (
      <div className="space-y-3">
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
          Propón otra fecha y hora
        </label>
        <input
          type="datetime-local"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
          className="w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
        />
        {error && <p className="text-sm text-brand-gold">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={proponerOtro}
            disabled={saving || !nuevaFecha}
            className="flex-1 bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-ink disabled:opacity-60"
          >
            {saving ? "Enviando…" : "Enviar propuesta"}
          </button>
          <button
            onClick={() => setModo(null)}
            className="border border-brand-line px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-goldDeep"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-brand-gold">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={aceptar}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-ink disabled:opacity-60"
        >
          {saving ? "Confirmando…" : "Aceptar este horario"}
        </button>
        <button
          onClick={() => setModo("otro")}
          className="flex-1 border border-brand-line px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"
        >
          Proponer otro
        </button>
      </div>
    </div>
  );
}
