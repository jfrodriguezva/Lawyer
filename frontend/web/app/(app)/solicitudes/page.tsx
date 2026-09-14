"use client";

import { useEffect, useState } from "react";
import {
  getSolicitudesCita,
  revisarSolicitudCita,
  type AccionRevisionSolicitud,
  type EstatusSolicitudCita,
  type SolicitudCita,
} from "@/lib/api";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const ETIQUETA_ESTATUS: Record<EstatusSolicitudCita, string> = {
  SolicitudRecibida: "Solicitud recibida",
  EnRevision: "En revisión",
  InformacionRequerida: "Información requerida",
  HorarioAlternativoPropuesto: "Horario alternativo propuesto",
  PendienteConfirmacionSolicitante: "Pendiente de confirmación",
  Confirmada: "Confirmada",
  Realizada: "Realizada",
  Cancelada: "Cancelada",
  NoAsistio: "No asistió",
  Rechazada: "Rechazada",
  ConvertidaEnContratacion: "Convertida en contratación",
};

const PENDIENTES: EstatusSolicitudCita[] = [
  "SolicitudRecibida",
  "EnRevision",
  "InformacionRequerida",
  "HorarioAlternativoPropuesto",
  "PendienteConfirmacionSolicitante",
];

export default function SolicitudesCitaPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getSolicitudesCita()
      .then(setSolicitudes)
      .catch(() => setError("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const pendientes = solicitudes.filter((s) => PENDIENTES.includes(s.estatus));
  const resueltas = solicitudes.filter((s) => !PENDIENTES.includes(s.estatus));

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Negociación de citas</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Solicitudes de cita</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Acepta, propone otro horario, pide información o rechaza cada solicitud recibida desde el sitio público.
      </p>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando solicitudes…</p>}

      {!loading && solicitudes.length === 0 && (
        <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay solicitudes de cita.</p>
      )}

      {!loading && pendientes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Pendientes ({pendientes.length})
          </h2>
          <div className="mt-3 space-y-3">
            {pendientes.map((s) => (
              <SolicitudCard key={s.id} solicitud={s} onActualizado={load} setError={setError} />
            ))}
          </div>
        </div>
      )}

      {!loading && resueltas.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Resueltas ({resueltas.length})
          </h2>
          <div className="mt-3 space-y-3">
            {resueltas.map((s) => (
              <SolicitudCard key={s.id} solicitud={s} onActualizado={load} setError={setError} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SolicitudCard({
  solicitud,
  onActualizado,
  setError,
}: {
  solicitud: SolicitudCita;
  onActualizado: () => void;
  setError: (msg: string | null) => void;
}) {
  const [modo, setModo] = useState<AccionRevisionSolicitud | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const esPendiente = PENDIENTES.includes(solicitud.estatus);

  async function ejecutar(accion: AccionRevisionSolicitud) {
    if (accion === "ProponerOtroHorario" && !nuevaFecha) return;
    if ((accion === "Rechazar" || accion === "PedirInformacion") && !motivo.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await revisarSolicitudCita(solicitud.id, {
        accion,
        nuevaFechaHora: accion === "ProponerOtroHorario" ? new Date(nuevaFecha).toISOString() : null,
        motivo: accion === "Rechazar" || accion === "PedirInformacion" ? motivo : null,
      });
      setModo(null);
      setNuevaFecha("");
      setMotivo("");
      onActualizado();
    } catch {
      setError("No se pudo actualizar la solicitud. Verifica que el horario no esté ocupado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`border px-5 py-4 transition-colors ${
        esPendiente ? "border-brand-gold/50 bg-brand-ink2" : "border-brand-line bg-brand-ink2/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-cream">{solicitud.nombreSolicitante}</p>
          <p className="text-xs text-brand-creamSoft">
            {solicitud.telefonoSolicitante} · {solicitud.emailSolicitante}
          </p>
        </div>
        <span className="border border-brand-line px-2 py-1 text-[10px] uppercase tracking-widest text-brand-gold">
          {ETIQUETA_ESTATUS[solicitud.estatus]}
        </span>
      </div>

      <p className="mt-3 text-sm text-brand-cream">
        <span className="text-brand-creamSoft">[{solicitud.modulo === "SAT" ? "SAT" : "Jurídico"}]</span>{" "}
        {new Date(solicitud.fechaHoraPropuesta).toLocaleString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        · {solicitud.modalidad}
        {solicitud.servicioInteres && <> · {solicitud.servicioInteres}</>}
      </p>
      {solicitud.descripcion && <p className="mt-2 text-sm text-brand-creamSoft">{solicitud.descripcion}</p>}
      {solicitud.motivo && (
        <p className="mt-2 text-xs text-brand-creamSoft">
          <span className="uppercase tracking-widest text-brand-gold">Motivo:</span> {solicitud.motivo}
        </p>
      )}

      {esPendiente && (
        <div className="mt-4 space-y-3">
          {modo === null && (
            <div className="flex flex-wrap gap-2">
              <a
                href={buildWhatsAppLink(solicitud.telefonoSolicitante, `Hola ${solicitud.nombreSolicitante}, te escribo de ECGAbogados por tu solicitud de cita.`)}
                target="_blank"
                rel="noreferrer"
                className="border border-brand-line px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                WhatsApp
              </a>
              <button
                onClick={() => ejecutar("Aceptar")}
                disabled={saving}
                className="border border-brand-gold px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
              >
                Aceptar
              </button>
              <button
                onClick={() => setModo("ProponerOtroHorario")}
                className="border border-brand-line px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                Proponer otro horario
              </button>
              <button
                onClick={() => setModo("PedirInformacion")}
                className="border border-brand-line px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                Pedir información
              </button>
              <button
                onClick={() => setModo("Rechazar")}
                className="border border-brand-goldDeep/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-goldDeep/20"
              >
                Rechazar
              </button>
            </div>
          )}

          {modo === "ProponerOtroHorario" && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                  Nueva fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="mt-2 border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>
              <input
                placeholder="Motivo (opcional)"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="flex-1 border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
              />
              <BotonesAccionInline saving={saving} onCancelar={() => setModo(null)} onConfirmar={() => ejecutar("ProponerOtroHorario")} />
            </div>
          )}

          {(modo === "Rechazar" || modo === "PedirInformacion") && (
            <div className="flex flex-wrap items-end gap-3">
              <input
                required
                placeholder={modo === "Rechazar" ? "Motivo del rechazo" : "¿Qué información necesitas?"}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="flex-1 border border-brand-line bg-transparent px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-gold"
              />
              <BotonesAccionInline saving={saving} onCancelar={() => setModo(null)} onConfirmar={() => ejecutar(modo)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BotonesAccionInline({
  saving,
  onCancelar,
  onConfirmar,
}: {
  saving: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onConfirmar}
        disabled={saving}
        className="border border-brand-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
      >
        Confirmar
      </button>
      <button
        onClick={onCancelar}
        className="border border-brand-line px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-goldDeep"
      >
        Cancelar
      </button>
    </div>
  );
}
