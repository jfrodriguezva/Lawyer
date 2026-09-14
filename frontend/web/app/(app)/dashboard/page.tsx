"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatTile from "@/components/StatTile";
import StatusPill from "@/components/StatusPill";
import {
  getCasos,
  getCitas,
  getMensajesContacto,
  getSolicitudesCita,
  getTareasPendientes,
  getTramitesSAT,
  type Caso,
  type Cita,
  type MensajeContacto,
  type SolicitudCita,
  type TareaCaso,
  type TramiteSAT,
} from "@/lib/api";
import { getCookie } from "@/lib/cookies";

const SOLICITUDES_PENDIENTES = [
  "SolicitudRecibida",
  "EnRevision",
  "InformacionRequerida",
  "HorarioAlternativoPropuesto",
  "PendienteConfirmacionSolicitante",
];

const TRAMITES_SAT_ABIERTOS = ["Pendiente", "EnProceso", "EsperandoCliente"];

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

function leerUsuario(): { nombre: string; rol: string | null } {
  if (typeof document === "undefined") return { nombre: "", rol: null };
  const raw = getCookie("ec_user");
  if (!raw) return { nombre: "", rol: null };
  try {
    const user = JSON.parse(raw);
    return { nombre: user.nombre ?? "", rol: user.rol ?? null };
  } catch {
    return { nombre: "", rol: null };
  }
}

export default function DashboardPage() {
  // Se lee el rol de forma síncrona (no en un efecto) para que el panel correcto
  // se elija desde el primer render: si se esperara a un efecto, el valor inicial
  // null caía en el panel de Abogado por defecto y disparaba llamadas a endpoints
  // de Casos que Consultor/Agente no pueden ver, generando 403 innecesarios.
  const [{ nombre, rol }] = useState(leerUsuario);

  if (rol === "Consultor") return <PanelConsultor nombre={nombre} />;
  if (rol === "Agente") return <PanelAgente nombre={nombre} />;
  return <PanelJuridico nombre={nombre} />;
}

// Panel del equipo jurídico: Abogado y Administrador ven el mismo tablero de casos,
// citas, solicitudes y tareas. El rol Administrador es superusuario, no un panel distinto.
function PanelJuridico({ nombre }: { nombre: string }) {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudCita[]>([]);
  const [tareas, setTareas] = useState<TareaCaso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCasos(), getCitas(), getMensajesContacto(), getSolicitudesCita(), getTareasPendientes()])
      .then(([casosData, citasData, mensajesData, solicitudesData, tareasData]) => {
        setCasos(casosData);
        setCitas(citasData);
        setMensajes(mensajesData);
        setSolicitudes(solicitudesData);
        setTareas(tareasData);
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

  const solicitudesPendientes = solicitudes.filter((s) => SOLICITUDES_PENDIENTES.includes(s.estatus));
  const tareasOrdenadas = [...tareas].sort((a, b) => {
    if (!a.fechaVencimiento) return 1;
    if (!b.fechaVencimiento) return -1;
    return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
  });
  const tareasVencidas = tareasOrdenadas.filter((t) => t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date());

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
      <PanelHeader nombre={nombre} titulo="Panel de Casos" />

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Casos activos" value={loading ? "—" : activos.length} />
        <StatTile label="En revisión" value={loading ? "—" : revision.length} />
        <StatTile label="Solicitudes pendientes" value={loading ? "—" : solicitudesPendientes.length} />
        <StatTile label="Tareas vencidas" value={loading ? "—" : tareasVencidas.length} />
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

        <section>
          <div className="flex items-center justify-between border-b border-brand-line pb-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Solicitudes pendientes de responder
            </h2>
            <Link href="/solicitudes" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {!loading && solicitudesPendientes.length === 0 && (
              <li className="text-sm text-brand-creamSoft">Sin solicitudes pendientes.</li>
            )}
            {solicitudesPendientes.slice(0, 5).map((s) => (
              <li key={s.id} className="border border-brand-line px-4 py-3">
                <p className="text-sm font-medium text-brand-cream">{s.nombreSolicitante}</p>
                <p className="text-xs text-brand-creamSoft">{formatFecha(s.fechaHoraPropuesta)} · {s.estatus}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-brand-line pb-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Tareas pendientes
            </h2>
          </div>
          <ul className="mt-4 space-y-3">
            {!loading && tareasOrdenadas.length === 0 && (
              <li className="text-sm text-brand-creamSoft">Sin tareas pendientes.</li>
            )}
            {tareasOrdenadas.slice(0, 5).map((t) => {
              const vencida = t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date();
              return (
                <li
                  key={t.id}
                  className={`border px-4 py-3 ${vencida ? "border-red-500/50 bg-red-500/10" : "border-brand-line"}`}
                >
                  <Link href={`/casos/${t.casoId}`} className="block">
                    <p className="text-sm font-medium text-brand-cream">{t.descripcion}</p>
                    <p className={`text-xs ${vencida ? "text-red-400" : "text-brand-creamSoft"}`}>
                      {t.responsableNombre ?? "Sin asignar"}
                      {t.fechaVencimiento && ` · ${new Date(t.fechaVencimiento).toLocaleDateString("es-MX")}`}
                      {vencida ? " · vencida" : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Panel del rol Consultor: solo ve el módulo SAT, así que su tablero muestra
// solicitudes de cita del módulo SAT y trámites SAT, sin tocar endpoints de Casos
// (Consultor no tiene permiso sobre ellos y antes esto disparaba un error genérico).
function PanelConsultor({ nombre }: { nombre: string }) {
  const [solicitudes, setSolicitudes] = useState<SolicitudCita[]>([]);
  const [tramites, setTramites] = useState<TramiteSAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSolicitudesCita(), getTramitesSAT()])
      .then(([solicitudesData, tramitesData]) => {
        setSolicitudes(solicitudesData);
        setTramites(tramitesData);
      })
      .catch(() => setError("No se pudieron cargar los datos del panel."))
      .finally(() => setLoading(false));
  }, []);

  const solicitudesPendientes = solicitudes.filter((s) => SOLICITUDES_PENDIENTES.includes(s.estatus));
  const tramitesAbiertos = tramites.filter((t) => TRAMITES_SAT_ABIERTOS.includes(t.estatus));
  const tramitesVencidos = tramitesAbiertos.filter(
    (t) => t.fechaLimite && new Date(t.fechaLimite) < new Date()
  );

  return (
    <div>
      <PanelHeader nombre={nombre} titulo="Panel SAT" />

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Solicitudes SAT pendientes" value={loading ? "—" : solicitudesPendientes.length} />
        <StatTile label="Trámites SAT abiertos" value={loading ? "—" : tramitesAbiertos.length} />
        <StatTile label="Trámites con fecha vencida" value={loading ? "—" : tramitesVencidos.length} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between border-b border-brand-line pb-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Solicitudes SAT pendientes
            </h2>
            <Link href="/solicitudes" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {!loading && solicitudesPendientes.length === 0 && (
              <li className="text-sm text-brand-creamSoft">Sin solicitudes pendientes.</li>
            )}
            {solicitudesPendientes.slice(0, 5).map((s) => (
              <li key={s.id} className="border border-brand-line px-4 py-3">
                <p className="text-sm font-medium text-brand-cream">{s.nombreSolicitante}</p>
                <p className="text-xs text-brand-creamSoft">{formatFecha(s.fechaHoraPropuesta)} · {s.estatus}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-brand-line pb-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Trámites SAT abiertos
            </h2>
            <Link href="/tramites-sat" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {!loading && tramitesAbiertos.length === 0 && (
              <li className="text-sm text-brand-creamSoft">Sin trámites abiertos.</li>
            )}
            {tramitesAbiertos.slice(0, 5).map((t) => (
              <li key={t.id} className="border border-brand-line px-4 py-3">
                <p className="text-sm font-medium text-brand-cream">{t.clienteNombre ?? "—"}</p>
                <p className="text-xs text-brand-creamSoft">{t.catalogoTramiteNombre ?? "Trámite"} · {t.estatus}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Panel del rol Agente: el módulo de Comercializadora todavía no se implementa
// (solo el flag reservado), así que no hay datos que consultar todavía.
function PanelAgente({ nombre }: { nombre: string }) {
  return (
    <div>
      <PanelHeader nombre={nombre} titulo="Panel de Comercializadora" />
      <div className="mt-8 border border-brand-line bg-brand-ink2 p-8 text-center">
        <p className="font-script text-lg italic text-brand-gold">Próximamente</p>
        <p className="mt-2 text-sm text-brand-creamSoft">
          El módulo de Comercializadora está en construcción. Cuando esté listo, aquí verás tus prospectos y
          seguimiento comercial.
        </p>
      </div>
    </div>
  );
}

function PanelHeader({ nombre, titulo }: { nombre: string; titulo: string }) {
  return (
    <>
      <p className="font-script text-lg italic text-brand-gold">
        {saludo()}{nombre ? `, ${nombre}` : ""}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">{titulo}</h1>
    </>
  );
}
