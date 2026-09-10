"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import StatusPill from "@/components/StatusPill";
import {
  cambiarEstatusCita,
  createCita,
  getCitas,
  type Cita,
} from "@/lib/api";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

const MENSAJES = {
  next: "Siguiente",
  previous: "Anterior",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Lista",
  date: "Fecha",
  time: "Hora",
  event: "Cita",
  noEventsInRange: "Sin citas en este rango.",
};

const COLOR_POR_ESTATUS: Record<Cita["estatus"], string> = {
  Pendiente: "#c9a24a",
  Confirmada: "#8c6b1f",
  Cancelada: "#3a3226",
};

interface CitaEvento {
  resource: Cita;
  title: string;
  start: Date;
  end: Date;
}

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Cita | null>(null);
  const [view, setView] = useState<View>("week");
  const [busqueda, setBusqueda] = useState("");

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

  const citasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return citas;
    return citas.filter(
      (c) =>
        c.nombreCliente.toLowerCase().includes(termino) ||
        c.telefono.toLowerCase().includes(termino)
    );
  }, [citas, busqueda]);

  const eventos: CitaEvento[] = useMemo(
    () =>
      citasFiltradas.map((c) => {
        const start = new Date(c.fechaHora);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return { resource: c, title: c.nombreCliente, start, end };
      }),
    [citasFiltradas]
  );

  const eventPropGetter = useCallback(
    (event: CitaEvento) => ({
      style: { backgroundColor: COLOR_POR_ESTATUS[event.resource.estatus] },
    }),
    []
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
      setSeleccionada((prev) => (prev?.id === id ? { ...prev, estatus } : prev));
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

          {seleccionada && (
            <div className="border-t border-brand-line pt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                Cita seleccionada
              </p>
              <p className="mt-2 text-sm text-brand-cream">{seleccionada.nombreCliente}</p>
              <p className="text-xs text-brand-creamSoft">
                {new Date(seleccionada.fechaHora).toLocaleString("es-MX")}
              </p>
              <div className="mt-3 flex gap-2">
                {seleccionada.estatus !== "Confirmada" && (
                  <button
                    onClick={() => handleEstatus(seleccionada.id, "Confirmada")}
                    className="border border-brand-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink"
                  >
                    Confirmar
                  </button>
                )}
                {seleccionada.estatus !== "Cancelada" && (
                  <button
                    onClick={() => handleEstatus(seleccionada.id, "Cancelada")}
                    className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-goldDeep hover:text-brand-goldDeep"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        <div className="lg:col-span-2">
          <label htmlFor="buscar-cita" className="sr-only">
            Buscar cita por nombre o teléfono
          </label>
          <input
            id="buscar-cita"
            type="search"
            placeholder="Buscar por nombre o teléfono…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mb-4 w-full max-w-sm border border-brand-line bg-transparent px-4 py-2.5 text-sm text-brand-cream outline-none focus:border-brand-gold"
          />
          {loading ? (
            <p className="text-sm text-brand-creamSoft">Cargando citas…</p>
          ) : (
            <div className="border border-brand-line bg-brand-ink2 p-4" style={{ height: 620 }}>
              <Calendar
                localizer={localizer}
                culture="es"
                messages={MENSAJES}
                events={eventos}
                view={view}
                onView={setView}
                views={["month", "week", "day", "agenda"]}
                style={{ height: "100%" }}
                className="ec-calendar"
                eventPropGetter={eventPropGetter}
                onSelectEvent={(event) => setSeleccionada((event as CitaEvento).resource)}
              />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] uppercase tracking-widest text-brand-creamSoft">
            <span className="flex items-center gap-1.5">
              <StatusPill estatus="Pendiente" /> pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <StatusPill estatus="Confirmada" /> confirmada
            </span>
            <span className="flex items-center gap-1.5">
              <StatusPill estatus="Cancelada" /> cancelada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
