"use client";

import { useEffect, useState, type FormEvent } from "react";
import { actualizarPlantilla, crearPlantilla, eliminarPlantilla, getPlantillas, type PlantillaMensaje } from "@/lib/api";

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    getPlantillas()
      .then(setPlantillas)
      .catch(() => setError("No se pudieron cargar las plantillas."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleEditar(p: PlantillaMensaje) {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setContenido(p.contenido);
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setNombre("");
    setContenido("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editandoId) {
        await actualizarPlantilla(editandoId, { nombre, contenido });
      } else {
        await crearPlantilla({ nombre, contenido });
      }
      limpiarFormulario();
      load();
    } catch {
      setError("No se pudo guardar la plantilla.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!window.confirm("¿Eliminar esta plantilla?")) return;
    try {
      await eliminarPlantilla(id);
      load();
    } catch {
      setError("No se pudo eliminar la plantilla.");
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Mensajes reutilizables</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Plantillas</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Textos listos para WhatsApp o correo (recordatorios, solicitudes de documentos, etc.).
      </p>

      {error && <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 border border-brand-line bg-brand-ink2 p-6">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Nombre</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Contenido</label>
          <textarea
            required
            rows={3}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear plantilla"}
          </button>
          {editandoId && (
            <button type="button" onClick={limpiarFormulario} className="border border-brand-line px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-creamSoft hover:border-brand-goldDeep">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando…</p>}
      {!loading && plantillas.length === 0 && <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay plantillas.</p>}

      <div className="mt-8 space-y-3">
        {plantillas.map((p) => (
          <div key={p.id} className="border border-brand-line bg-brand-ink2 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm font-medium text-brand-cream">{p.nombre}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEditar(p)} className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
                  Editar
                </button>
                <button onClick={() => handleEliminar(p.id)} className="border border-brand-goldDeep/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-goldDeep/20">
                  Eliminar
                </button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-brand-creamSoft">{p.contenido}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
