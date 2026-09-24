"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { IconUpload } from "@/components/icons";
import {
  actualizarPromocion,
  cambiarActivoPromocion,
  crearPromocion,
  eliminarPromocion,
  getModulos,
  getPromociones,
  getServicios,
  promocionImagenUrl,
  type Modulo,
  type Promocion,
  type Servicio,
} from "@/lib/api";

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [servicioIds, setServicioIds] = useState<number[]>([]);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    Promise.all([getPromociones(), getModulos(), getServicios()])
      .then(([p, m, s]) => {
        setPromociones(p);
        setModulos(m);
        setServicios(s);
      })
      .catch(() => setError("No se pudo cargar. ¿Tu cuenta tiene rol Administrador?"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setTexto("");
    setServicioIds([]);
    setImagenFile(null);
    setImagenPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleEditar(p: Promocion) {
    setEditandoId(p.id);
    setTexto(p.texto);
    setServicioIds(p.servicioIds);
    setImagenFile(null);
    setImagenPreview(promocionImagenUrl(p.id));
  }

  function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImagenFile(file);
    setImagenPreview(file ? URL.createObjectURL(file) : null);
  }

  function toggleServicio(id: number) {
    setServicioIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (servicioIds.length === 0) {
      setError("Selecciona al menos un servicio.");
      return;
    }
    if (!editandoId && !imagenFile) {
      setError("Selecciona una imagen para la promoción.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editandoId) {
        await actualizarPromocion(editandoId, { texto, imagen: imagenFile, servicioIds });
      } else {
        await crearPromocion({ texto, imagen: imagenFile!, servicioIds });
      }
      limpiarFormulario();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la promoción.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActivo(p: Promocion) {
    try {
      await cambiarActivoPromocion(p.id, !p.activo);
      setPromociones((prev) => prev.map((x) => (x.id === p.id ? { ...x, activo: !p.activo } : x)));
    } catch {
      setError("No se pudo actualizar la promoción.");
    }
  }

  async function handleEliminar(id: number) {
    if (!window.confirm("¿Eliminar esta promoción?")) return;
    try {
      await eliminarPromocion(id);
      load();
    } catch {
      setError("No se pudo eliminar la promoción.");
    }
  }

  function tituloServicio(id: number) {
    return servicios.find((s) => s.id === id)?.titulo ?? `Servicio #${id}`;
  }

  // Un servicio solo puede tener una promoción: se deshabilita en el checklist
  // si ya pertenece a OTRA promoción (no a la que se está editando ahora mismo).
  const serviciosOcupados = new Set(
    promociones.filter((p) => p.id !== editandoId).flatMap((p) => p.servicioIds)
  );

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Mercadeo</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Promociones</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-creamSoft">
        Sube una imagen y un texto para anunciar una promoción en uno o varios servicios. Se muestra en la página
        pública del servicio y avisa con un punto rojo en el menú &quot;Servicios&quot; del sitio.
      </p>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 border border-brand-line bg-brand-ink2 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
          {editandoId ? "Editar promoción" : "Nueva promoción"}
        </p>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Texto</label>
          <textarea
            required
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Imagen</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 border border-brand-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-ink">
              <IconUpload className="h-4 w-4" />
              {editandoId ? "Reemplazar imagen" : "Elegir imagen"}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleArchivoSeleccionado} />
            </label>
            {imagenPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagenPreview} alt="Vista previa" className="h-20 w-32 border border-brand-line object-cover" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Servicios en promoción
          </label>
          <p className="mt-1 text-xs text-brand-creamSoft">
            Un servicio solo puede tener una promoción a la vez — los que ya tienen una aparecen atenuados.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modulos.map((m) => {
              const susServicios = servicios.filter((s) => s.moduloId === m.id);
              if (susServicios.length === 0) return null;
              return (
                <div key={m.id} className="border border-brand-line p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">{m.nombre}</p>
                  <div className="mt-2 space-y-1.5">
                    {susServicios.map((s) => {
                      const ocupado = serviciosOcupados.has(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2 text-xs ${ocupado ? "text-brand-creamSoft/40" : "text-brand-creamSoft"}`}
                        >
                          <input
                            type="checkbox"
                            checked={servicioIds.includes(s.id)}
                            disabled={ocupado}
                            onChange={() => toggleServicio(s.id)}
                          />
                          {s.titulo}
                          {ocupado && <span className="italic">(ya tiene promoción)</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear promoción"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="border border-brand-line px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-creamSoft hover:border-brand-goldDeep"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando…</p>}
      {!loading && promociones.length === 0 && <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay promociones.</p>}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promociones.map((p) => (
          <div key={p.id} className={`border ${p.activo ? "border-brand-line bg-brand-ink2" : "border-brand-line bg-brand-ink2/60 opacity-60"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={promocionImagenUrl(p.id)} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="line-clamp-3 text-sm text-brand-cream">{p.texto}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.servicioIds.map((id) => (
                  <span key={id} className="border border-brand-line px-2 py-0.5 text-[10px] uppercase tracking-widest text-brand-creamSoft">
                    {tituloServicio(id)}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleToggleActivo(p)} className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${p.activo ? "border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-ink" : "border-brand-line text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"}`}>
                  {p.activo ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => handleEditar(p)} className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
                  Editar
                </button>
                <button onClick={() => handleEliminar(p.id)} className="border border-brand-goldDeep/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-goldDeep/20">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
