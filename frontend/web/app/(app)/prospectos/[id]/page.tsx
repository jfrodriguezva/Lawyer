"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  convertirProspecto,
  getProspecto,
  registrarResultadoEntrevista,
  type EstatusConflictoInteres,
  type ProspectoDetalle,
} from "@/lib/api";

export default function ProspectoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detalle, setDetalle] = useState<ProspectoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getProspecto(params.id)
      .then(setDetalle)
      .catch(() => setError("No se pudo cargar el prospecto."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  if (loading) return <p className="text-sm text-brand-creamSoft">Cargando…</p>;
  if (error || !detalle) return <p className="text-sm text-brand-gold">{error ?? "No encontrado."}</p>;

  const { prospecto, solicitudes } = detalle;
  const yaConvertido = prospecto.clienteId !== null;

  return (
    <div>
      <nav className="text-xs text-brand-creamSoft">
        <Link href="/prospectos" className="hover:text-brand-gold">Prospectos</Link> / {prospecto.nombre}
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-script text-lg italic text-brand-gold">Prospecto</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">{prospecto.nombre}</h1>
          <p className="mt-1 text-sm text-brand-creamSoft">
            {prospecto.telefono} · {prospecto.email} · {prospecto.medioContactoPreferido ?? "Sin medio preferido"}
          </p>
        </div>
        {yaConvertido && (
          <span className="border border-brand-gold px-3 py-1.5 text-xs uppercase tracking-widest text-brand-gold">
            Ya es cliente
          </span>
        )}
      </div>

      <section className="mt-8 border border-brand-line bg-brand-ink2 p-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Historial de solicitudes de cita</h2>
        {solicitudes.length === 0 ? (
          <p className="mt-3 text-sm text-brand-creamSoft">Sin solicitudes registradas.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {solicitudes.map((s) => (
              <li key={s.id} className="text-sm text-brand-cream">
                {new Date(s.fechaHoraPropuesta).toLocaleString("es-MX")} · {s.modalidad} ·{" "}
                <span className="text-brand-creamSoft">{s.estatus}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!yaConvertido && (
        <>
          <EntrevistaForm
            prospectoId={prospecto.id}
            valorInicial={prospecto.resultadoEntrevista}
            conflictoInicial={prospecto.conflictoInteres}
            onGuardado={load}
          />
          <ConvertirForm prospectoId={prospecto.id} nombre={prospecto.nombre} onConvertido={(casoId) => router.push(`/casos/${casoId}`)} />
        </>
      )}
    </div>
  );
}

function EntrevistaForm({
  prospectoId,
  valorInicial,
  conflictoInicial,
  onGuardado,
}: {
  prospectoId: number;
  valorInicial: string | null;
  conflictoInicial: EstatusConflictoInteres;
  onGuardado: () => void;
}) {
  const [resultado, setResultado] = useState(valorInicial ?? "");
  const [conflicto, setConflicto] = useState<EstatusConflictoInteres>(conflictoInicial);
  const [motivoNoContratacion, setMotivoNoContratacion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await registrarResultadoEntrevista(prospectoId, {
        resultadoEntrevista: resultado,
        conflictoInteres: conflicto,
        motivoNoContratacion: motivoNoContratacion || null,
      });
      onGuardado();
    } catch {
      setError("No se pudo guardar el resultado de la entrevista.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border border-brand-line bg-brand-ink2 p-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Resultado de la entrevista</h2>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Notas de la entrevista</label>
        <textarea
          rows={3}
          value={resultado}
          onChange={(e) => setResultado(e.target.value)}
          className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Conflicto de interés</label>
          <select
            value={conflicto}
            onChange={(e) => setConflicto(e.target.value as EstatusConflictoInteres)}
            className="mt-2 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Revisado">Revisado</option>
            <option value="Autorizado">Autorizado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Motivo por el que no contrató (si aplica)
          </label>
          <input
            value={motivoNoContratacion}
            onChange={(e) => setMotivoNoContratacion(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
      </div>
      {error && <p className="text-sm text-brand-gold">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="border border-brand-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold hover:bg-brand-gold hover:text-brand-ink disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar resultado"}
      </button>
    </form>
  );
}

function ConvertirForm({
  prospectoId,
  nombre,
  onConvertido,
}: {
  prospectoId: number;
  nombre: string;
  onConvertido: (casoId: number) => void;
}) {
  const [tipoCaso, setTipoCaso] = useState("");
  const [notasCaso, setNotasCaso] = useState("");
  const [password, setPassword] = useState("");
  const [usarPassword, setUsarPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const resultado = await convertirProspecto(prospectoId, {
        tipoCaso,
        notasCaso: notasCaso || null,
        password: usarPassword ? password : null,
      });
      onConvertido(resultado.casoId);
    } catch {
      setError("No se pudo convertir al prospecto (¿ya existe un cliente con ese correo?).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border border-brand-gold/50 bg-brand-ink2 p-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-gold">Convertir en cliente</h2>
      <p className="text-sm text-brand-creamSoft">
        Se creará la cuenta de cliente para {nombre} y su primer expediente, sin volver a capturar sus datos de contacto.
      </p>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Tipo de asunto / caso</label>
        <input
          required
          value={tipoCaso}
          onChange={(e) => setTipoCaso(e.target.value)}
          placeholder="Ej. Divorcio incausado"
          className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Notas iniciales (opcional)</label>
        <textarea
          rows={2}
          value={notasCaso}
          onChange={(e) => setNotasCaso(e.target.value)}
          className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-brand-creamSoft">
        <input type="checkbox" checked={usarPassword} onChange={(e) => setUsarPassword(e.target.checked)} />
        Establecer yo la contraseña (si no, se envía una invitación segura por correo)
      </label>
      {usarPassword && (
        <input
          type="password"
          minLength={8}
          required={usarPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña temporal"
          className="w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
        />
      )}

      {error && <p className="text-sm text-brand-gold">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Convirtiendo…" : "Convertir en cliente"}
      </button>
    </form>
  );
}
