"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatTile from "@/components/StatTile";
import StatusPill from "@/components/StatusPill";
import { getCasos, getCitas, getMensajesContacto, type Caso, type Cita, type MensajeContacto } from "@/lib/api";
import { getCookie } from "@/lib/cookies";

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [nombre, setNombre] = useState("");
  const [casos, setCasos] = useState<Caso[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        setNombre(JSON.parse(raw).nombre ?? "");
      } catch {
        // ignore malformed cookie
      }
    }

    Promise.all([getCasos(), getCitas(), getMensajesContacto()])
      .then(([casosData, citasData, mensajesData]) => {
        setCasos(casosData);
        setCitas(citasData);
        setMensajes(mensajesData);
      })
      .catch(() => setError("No se pudieron cargar los datos del panel."))
      .finally(() => setLoading(false));
  }, []);

  const activos = casos.filter((c) => c.estatus === "Activo");
  const revision = casos.filter((c) => c.estatus === "Revision");
  const cerrados = casos.filter((c) => c.estatus === "Cerrado");
  const proximasCitas = citas
    .filter((c) => c.estatus !== "Cancelada")
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, 5);

  const tasaConfirmacion =
    citas.length > 0
      ? Math.round((citas.filter((c) => c.estatus === "Confirmada").length / citas.length) * 100)
      : 0;
  const tasaAtencionMensajes =
    mensajes.length > 0
      ? Math.round((mensajes.filter((m) => m.atendido).length / mensajes.length) * 100)
      : 0;

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">
        {saludo()}{nombre ? `, ${nombre}` : ""}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">
        Panel de Casos
      </h1>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Casos activos" value={loading ? "—" : activos.length} />
        <StatTile label="En revisión" value={loading ? "—" : revision.length} />
        <StatTile label="Próximas citas" value={loading ? "—" : proximasCitas.length} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Casos cerrados" value={loading ? "—" : cerrados.length} />
        <StatTile label="Tasa de confirmación de citas" value={loading ? "—" : `${tasaConfirmacion}%`} />
        <StatTile label="Mensajes atendidos" value={loading ? "—" : `${tasaAtencionMensajes}%`} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between border-b border-brand-line pb-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Casos activos recientes
            </h2>
            <Link href="/casos" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {!loading && activos.length === 0 && (
              <li className="text-sm text-brand-creamSoft">Sin casos activos.</li>
            )}
            {activos.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/casos/${c.id}`}
                  className="flex items-center justify-between border border-brand-line px-4 py-3 transition-colors hover:border-brand-gold/60"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-cream">{c.clienteNombre}</p>
                    <p className="text-xs text-brand-creamSoft">{c.tipo}</p>
                  </div>
                  <StatusPill estatus={c.estatus} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-brand-line pb-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Próximas citas
            </h2>
            <Link href="/agenda" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
              Ver agenda
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {!loading && proximasCitas.length === 0 && (
              <li className="text-sm text-brand-creamSoft">Sin citas próximas.</li>
            )}
            {proximasCitas.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border border-brand-line px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-brand-cream">{c.nombreCliente}</p>
                  <p className="text-xs text-brand-creamSoft">{formatFecha(c.fechaHora)}</p>
                </div>
                <StatusPill estatus={c.estatus} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
