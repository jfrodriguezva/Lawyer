"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";
import { createCaso, getCasos, type Caso } from "@/lib/api";

const TIPOS = [
  "Divorcio",
  "Pensión alimenticia",
  "Custodia",
  "Régimen de visitas",
  "Violencia familiar",
  "Otro",
];

export default function CasosPage() {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [clienteNombre, setClienteNombre] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [notas, setNotas] = useState("");

  function load() {
    setLoading(true);
    getCasos()
      .then(setCasos)
      .catch(() => setError("No se pudieron cargar los expedientes."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCaso({ clienteNombre, tipo, notas });
      setClienteNombre("");
      setTipo(TIPOS[0]);
      setNotas("");
      setShowForm(false);
      load();
    } catch {
      setError("No se pudo crear el expediente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-script text-lg italic text-brand-gold">Expedientes</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">
            Casos de la firma
          </h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="border border-brand-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink"
        >
          {showForm ? "Cancelar" : "Nuevo expediente"}
        </button>
      </div>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid grid-cols-1 gap-4 border border-brand-line bg-brand-ink2 p-6 sm:grid-cols-2"
        >
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Nombre del cliente
            </label>
            <input
              required
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Tipo de caso
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
              Notas iniciales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar expediente"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 border border-brand-line">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
          <span>Cliente</span>
          <span>Tipo</span>
          <span>Apertura</span>
          <span>Estatus</span>
        </div>
        {loading && (
          <p className="px-5 py-6 text-sm text-brand-creamSoft">Cargando expedientes…</p>
        )}
        {!loading && casos.length === 0 && (
          <p className="px-5 py-6 text-sm text-brand-creamSoft">Aún no hay expedientes registrados.</p>
        )}
        {casos.map((c) => (
          <Link
            key={c.id}
            href={`/casos/${c.id}`}
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr] items-center gap-4 border-b border-brand-line px-5 py-4 text-sm text-brand-cream transition-colors last:border-b-0 hover:bg-brand-ink2"
          >
            <span className="font-medium">{c.clienteNombre}</span>
            <span className="text-brand-creamSoft">{c.tipo}</span>
            <span className="text-brand-creamSoft">
              {new Date(c.fechaApertura).toLocaleDateString("es-MX")}
            </span>
            <StatusPill estatus={c.estatus} />
          </Link>
        ))}
      </div>
    </div>
  );
}
