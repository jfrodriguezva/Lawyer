"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import StatusPill from "@/components/StatusPill";
import {
  cambiarEstatusCita,
  createCita,
  getCitas,
  type Cita,
} from "@/lib/api";

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [casoId, setCasoId] = useState("");

  function load() {
    setLoading(true);
    getCitas()
      .then(setCitas)
      .catch(() => setError("No se pudieron cargar las citas."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const citasOrdenadas = useMemo(
    () =>
      [...citas].sort(
        (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      ),
    [citas]
  );

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCita({
        nombreCliente,
        telefono,
        fechaHora: new Date(fechaHora).toISOString(),
        casoId: casoId ? Number(casoId) : null,
      });
      setNombreCliente("");
      setTelefono("");
      setFechaHora("");
      setCasoId("");
      load();
    } catch {
      setError("No se pudo agendar la cita.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEstatus(id: number, estatus: Cita["estatus"]) {
    try {
      await cambiarEstatusCita(id, estatus);
      setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estatus } : c)));
    } catch {
      setError("No se pudo actualizar la cita.");
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">
        Agenda tu asesoría hoy
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">
        Agenda de Asesorías
      </h1>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          onSubmit={handleCreate}
          className="space-y-4 border border-brand-line bg-brand-ink2 p-6 lg:col-span-1"
        >
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Nueva cita
          </h2>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Nombre del cliente
            </label>
            <input
              required
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Teléfono
            </label>
            <input
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Fecha y hora
            </label>
            <input
              required
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              ID de expediente (opcional)
            </label>
            <input
              value={casoId}
              onChange={(e) => setCasoId(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Agendando…" : "Agendar cita"}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="border border-brand-line">
            <div className="grid grid-cols-[1.4fr_1fr_1.2fr_1fr_1.4fr] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              <span>Cliente</span>
              <span>Teléfono</span>
              <span>Fecha</span>
              <span>Estatus</span>
              <span>Acciones</span>
            </div>
            {loading && (
              <p className="px-5 py-6 text-sm text-brand-creamSoft">Cargando citas…</p>
            )}
            {!loading && citasOrdenadas.length === 0 && (
              <p className="px-5 py-6 text-sm text-brand-creamSoft">Sin citas agendadas.</p>
            )}
            {citasOrdenadas.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1.4fr_1fr_1.2fr_1fr_1.4fr] items-center gap-4 border-b border-brand-line px-5 py-4 text-sm text-brand-cream last:border-b-0"
              >
                <span className="font-medium">{c.nombreCliente}</span>
                <span className="text-brand-creamSoft">{c.telefono}</span>
                <span className="text-brand-creamSoft">
                  {new Date(c.fechaHora).toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <StatusPill estatus={c.estatus} />
                <div className="flex gap-2">
                  {c.estatus !== "Confirmada" && (
                    <button
                      onClick={() => handleEstatus(c.id, "Confirmada")}
                      className="border border-brand-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink"
                    >
                      Confirmar
                    </button>
                  )}
                  {c.estatus !== "Cancelada" && (
                    <button
                      onClick={() => handleEstatus(c.id, "Cancelada")}
                      className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-goldDeep hover:text-brand-goldDeep"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
