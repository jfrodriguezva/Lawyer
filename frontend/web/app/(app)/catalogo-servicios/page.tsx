"use client";

import { useEffect, useState, type FormEvent } from "react";
import { IconChevronDown } from "@/components/icons";
import {
  actualizarModulo,
  actualizarServicio,
  cambiarActivoModulo,
  cambiarActivoServicio,
  crearModulo,
  crearServicio,
  eliminarModulo,
  eliminarServicio,
  getModulos,
  getServicios,
  RolesResponsablesModulo,
  type BeneficioServicio,
  type IconoBeneficio,
  type Modulo,
  type PasoProcesoServicio,
  type RolResponsableModulo,
  type Servicio,
} from "@/lib/api";

const ICONOS_BENEFICIO: { value: IconoBeneficio; label: string }[] = [
  { value: "scale", label: "Balanza" },
  { value: "gavel", label: "Martillo" },
  { value: "document", label: "Documento" },
  { value: "family", label: "Familia" },
  { value: "clock", label: "Reloj" },
  { value: "lock", label: "Candado" },
  { value: "handHeart", label: "Mano con corazón" },
  { value: "pin", label: "Ubicación" },
  { value: "money", label: "Dinero" },
  { value: "briefcase", label: "Maletín" },
  { value: "calculator", label: "Calculadora" },
];

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ServicioFormState {
  moduloId: number;
  id: number | null;
  titulo: string;
  frase: string;
  descripcion: string;
  tipo: string;
  orden: string;
  beneficios: BeneficioServicio[];
  proceso: PasoProcesoServicio[];
}

function formularioServicioVacio(moduloId: number): ServicioFormState {
  return {
    moduloId,
    id: null,
    titulo: "",
    frase: "",
    descripcion: "",
    tipo: "",
    orden: "0",
    beneficios: [],
    proceso: [],
  };
}

export default function ServiciosAdminPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);

  // Formulario de Módulo (crear/editar, reutilizado)
  const [moduloFormAbierto, setModuloFormAbierto] = useState(false);
  const [editandoModuloId, setEditandoModuloId] = useState<number | null>(null);
  const [nombreModulo, setNombreModulo] = useState("");
  const [slugModulo, setSlugModulo] = useState("");
  const [slugModuloTocado, setSlugModuloTocado] = useState(false);
  const [rolResponsable, setRolResponsable] = useState<RolResponsableModulo>("Abogado");
  const [ordenModulo, setOrdenModulo] = useState("0");
  const [savingModulo, setSavingModulo] = useState(false);

  // Formulario de Servicio (crear/editar, uno a la vez, dentro del módulo expandido)
  const [servicioForm, setServicioForm] = useState<ServicioFormState | null>(null);
  const [savingServicio, setSavingServicio] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getModulos(), getServicios()])
      .then(([m, s]) => {
        setModulos(m);
        setServicios(s);
      })
      .catch(() => setError("No se pudo cargar el catálogo. ¿Tu cuenta tiene rol Administrador?"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // ---- Módulo ----

  function abrirNuevoModulo() {
    setEditandoModuloId(null);
    setNombreModulo("");
    setSlugModulo("");
    setSlugModuloTocado(false);
    setRolResponsable("Abogado");
    setOrdenModulo(String((modulos.length + 1) * 10));
    setModuloFormAbierto(true);
  }

  function abrirEditarModulo(m: Modulo) {
    setEditandoModuloId(m.id);
    setNombreModulo(m.nombre);
    setSlugModulo(m.slug);
    setSlugModuloTocado(true);
    setRolResponsable(m.rolResponsable);
    setOrdenModulo(String(m.orden));
    setModuloFormAbierto(true);
  }

  function cerrarFormModulo() {
    setModuloFormAbierto(false);
    setEditandoModuloId(null);
  }

  async function handleSubmitModulo(e: FormEvent) {
    e.preventDefault();
    setSavingModulo(true);
    setError(null);
    try {
      const data = { nombre: nombreModulo, slug: slugModulo, rolResponsable, orden: Number(ordenModulo) || 0 };
      if (editandoModuloId) {
        await actualizarModulo(editandoModuloId, data);
      } else {
        await crearModulo(data);
      }
      cerrarFormModulo();
      load();
    } catch {
      setError("No se pudo guardar el módulo.");
    } finally {
      setSavingModulo(false);
    }
  }

  async function handleToggleModulo(m: Modulo) {
    try {
      await cambiarActivoModulo(m.id, !m.activo);
      setModulos((prev) => prev.map((x) => (x.id === m.id ? { ...x, activo: !m.activo } : x)));
    } catch {
      setError("No se pudo actualizar el módulo.");
    }
  }

  async function handleEliminarModulo(m: Modulo) {
    const susServicios = servicios.filter((s) => s.moduloId === m.id);
    const aviso =
      susServicios.length > 0
        ? `¿Eliminar el módulo "${m.nombre}"? Esto también eliminará sus ${susServicios.length} servicio(s).`
        : `¿Eliminar el módulo "${m.nombre}"?`;
    if (!window.confirm(aviso)) return;
    try {
      await eliminarModulo(m.id);
      load();
    } catch {
      setError("No se pudo eliminar el módulo.");
    }
  }

  // ---- Servicio ----

  function abrirNuevoServicio(moduloId: number) {
    setServicioForm(formularioServicioVacio(moduloId));
    setExpandidoId(moduloId);
  }

  function abrirEditarServicio(s: Servicio) {
    setServicioForm({
      moduloId: s.moduloId,
      id: s.id,
      titulo: s.titulo,
      frase: s.frase ?? "",
      descripcion: s.descripcion,
      tipo: s.tipo ?? "",
      orden: String(s.orden),
      beneficios: s.beneficios,
      proceso: s.proceso,
    });
    setExpandidoId(s.moduloId);
  }

  async function handleSubmitServicio(e: FormEvent) {
    e.preventDefault();
    if (!servicioForm) return;
    setSavingServicio(true);
    setError(null);
    try {
      const data = {
        moduloId: servicioForm.moduloId,
        slug: slugify(servicioForm.titulo),
        titulo: servicioForm.titulo,
        frase: servicioForm.frase || null,
        descripcion: servicioForm.descripcion,
        tipo: servicioForm.tipo || null,
        beneficios: servicioForm.beneficios,
        proceso: servicioForm.proceso,
        orden: Number(servicioForm.orden) || 0,
      };
      if (servicioForm.id) {
        await actualizarServicio(servicioForm.id, data);
      } else {
        await crearServicio(data);
      }
      setServicioForm(null);
      load();
    } catch {
      setError("No se pudo guardar el servicio. Revisa que tenga al menos un beneficio y un paso del proceso.");
    } finally {
      setSavingServicio(false);
    }
  }

  async function handleToggleServicio(s: Servicio) {
    try {
      await cambiarActivoServicio(s.id, !s.activo);
      setServicios((prev) => prev.map((x) => (x.id === s.id ? { ...x, activo: !s.activo } : x)));
    } catch {
      setError("No se pudo actualizar el servicio.");
    }
  }

  async function handleEliminarServicio(s: Servicio) {
    if (!window.confirm(`¿Eliminar el servicio "${s.titulo}"?`)) return;
    try {
      await eliminarServicio(s.id);
      load();
    } catch {
      setError("No se pudo eliminar el servicio.");
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Catálogo público</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Servicios</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-creamSoft">
        Los Módulos son las categorías padre del sitio (Abogado, SAT, Comercializadora, o las que agregues). Cada
        Módulo agrupa sus Servicios, que son las fichas que se publican en /servicios.
      </p>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>
      )}

      <div className="mt-6">
        {!moduloFormAbierto && (
          <button
            onClick={abrirNuevoModulo}
            className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90"
          >
            + Nuevo módulo
          </button>
        )}

        {moduloFormAbierto && (
          <form onSubmit={handleSubmitModulo} className="space-y-4 border border-brand-line bg-brand-ink2 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              {editandoModuloId ? "Editar módulo" : "Nuevo módulo"}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Nombre</label>
                <input
                  required
                  value={nombreModulo}
                  onChange={(e) => {
                    setNombreModulo(e.target.value);
                    if (!slugModuloTocado) setSlugModulo(slugify(e.target.value));
                  }}
                  className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Slug</label>
                <input
                  required
                  value={slugModulo}
                  onChange={(e) => {
                    setSlugModulo(e.target.value);
                    setSlugModuloTocado(true);
                  }}
                  className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
                  Rol que atiende sus citas
                </label>
                <select
                  value={rolResponsable}
                  onChange={(e) => setRolResponsable(e.target.value as RolResponsableModulo)}
                  className="mt-2 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
                >
                  {RolesResponsablesModulo.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-brand-creamSoft">
                  Abogado/Consultor usan la agenda de citas actual. Agente todavía no tiene agenda: solo formulario de contacto.
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Orden</label>
                <input
                  type="number"
                  value={ordenModulo}
                  onChange={(e) => setOrdenModulo(e.target.value)}
                  className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingModulo}
                className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60"
              >
                {savingModulo ? "Guardando…" : editandoModuloId ? "Guardar cambios" : "Crear módulo"}
              </button>
              <button
                type="button"
                onClick={cerrarFormModulo}
                className="border border-brand-line px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-creamSoft hover:border-brand-goldDeep"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {loading && <p className="mt-8 text-sm text-brand-creamSoft">Cargando…</p>}
      {!loading && modulos.length === 0 && <p className="mt-8 text-sm text-brand-creamSoft">Aún no hay módulos.</p>}

      <div className="mt-8 space-y-4">
        {modulos.map((m) => {
          const susServicios = servicios.filter((s) => s.moduloId === m.id);
          const expandido = expandidoId === m.id;

          return (
            <div key={m.id} className={`border ${m.activo ? "border-brand-line" : "border-brand-line opacity-60"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-ink2 px-5 py-4">
                <button
                  onClick={() => setExpandidoId(expandido ? null : m.id)}
                  className="flex items-center gap-2 text-left"
                >
                  <IconChevronDown className={`h-3.5 w-3.5 text-brand-gold transition-transform ${expandido ? "rotate-180" : ""}`} />
                  <span>
                    <span className="font-display text-base font-bold text-brand-cream">{m.nombre}</span>
                    <span className="ml-2 text-xs text-brand-creamSoft">
                      {susServicios.length} servicio{susServicios.length === 1 ? "" : "s"} · rol {m.rolResponsable}
                    </span>
                  </span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleModulo(m)}
                    className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                      m.activo ? "border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-ink" : "border-brand-line text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"
                    }`}
                  >
                    {m.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => abrirEditarModulo(m)}
                    className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarModulo(m)}
                    className="border border-brand-goldDeep/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-goldDeep/20"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {!m.activo && (
                <p className="bg-brand-ink2/60 px-5 py-2 text-xs italic text-brand-creamSoft">
                  Módulo inactivo: se muestra como &quot;Próximamente&quot; en el sitio público.
                </p>
              )}

              {expandido && (
                <div className="space-y-3 border-t border-brand-line p-5">
                  {/* Arriba de la lista a propósito: con varios servicios ya
                      cargados (ej. Abogado con 10), el botón quedaba enterrado
                      al fondo del scroll y era fácil no encontrarlo. */}
                  {servicioForm && servicioForm.moduloId === m.id ? (
                    <ServicioForm
                      form={servicioForm}
                      saving={savingServicio}
                      onChange={setServicioForm}
                      onSubmit={handleSubmitServicio}
                      onCancelar={() => setServicioForm(null)}
                    />
                  ) : (
                    <button
                      onClick={() => abrirNuevoServicio(m.id)}
                      className="border border-brand-gold/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-gold hover:text-brand-ink"
                    >
                      + Nuevo servicio en este módulo
                    </button>
                  )}

                  {susServicios.map((s) => (
                    <ServicioRow
                      key={s.id}
                      servicio={s}
                      onEditar={() => abrirEditarServicio(s)}
                      onToggle={() => handleToggleServicio(s)}
                      onEliminar={() => handleEliminarServicio(s)}
                    />
                  ))}

                  {susServicios.length === 0 && (
                    <p className="text-sm text-brand-creamSoft">Este módulo todavía no tiene servicios.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ServicioRow({
  servicio,
  onEditar,
  onToggle,
  onEliminar,
}: {
  servicio: Servicio;
  onEditar: () => void;
  onToggle: () => void;
  onEliminar: () => void;
}) {
  return (
    <div className={`border px-4 py-3 ${servicio.activo ? "border-brand-line bg-brand-ink" : "border-brand-line bg-brand-ink/60 opacity-60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-cream">{servicio.titulo}</p>
          <p className="text-xs text-brand-creamSoft">/servicios/{servicio.slug}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onToggle} className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
            {servicio.activo ? "Ocultar" : "Mostrar"}
          </button>
          <button onClick={onEditar} className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold">
            Editar
          </button>
          <button onClick={onEliminar} className="border border-brand-goldDeep/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-gold hover:bg-brand-goldDeep/20">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicioForm({
  form,
  saving,
  onChange,
  onSubmit,
  onCancelar,
}: {
  form: ServicioFormState;
  saving: boolean;
  onChange: (form: ServicioFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancelar: () => void;
}) {
  function set<K extends keyof ServicioFormState>(campo: K, valor: ServicioFormState[K]) {
    onChange({ ...form, [campo]: valor });
  }

  function agregarBeneficio() {
    set("beneficios", [...form.beneficios, { icono: "scale", titulo: "", texto: "" }]);
  }

  function actualizarBeneficio(i: number, campo: keyof BeneficioServicio, valor: string) {
    const copia = [...form.beneficios];
    copia[i] = { ...copia[i], [campo]: valor } as BeneficioServicio;
    set("beneficios", copia);
  }

  function quitarBeneficio(i: number) {
    set("beneficios", form.beneficios.filter((_, idx) => idx !== i));
  }

  function agregarPaso() {
    const numero = String(form.proceso.length + 1).padStart(2, "0");
    set("proceso", [...form.proceso, { numero, titulo: "", texto: "" }]);
  }

  function actualizarPaso(i: number, campo: keyof PasoProcesoServicio, valor: string) {
    const copia = [...form.proceso];
    copia[i] = { ...copia[i], [campo]: valor };
    set("proceso", copia);
  }

  function quitarPaso(i: number) {
    set("proceso", form.proceso.filter((_, idx) => idx !== i));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-brand-gold/40 bg-brand-ink p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
        {form.id ? "Editar servicio" : "Nuevo servicio"}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Título</label>
          <input required value={form.titulo} onChange={(e) => set("titulo", e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Frase (hero)</label>
          <input value={form.frase} onChange={(e) => set("frase", e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Descripción</label>
        <textarea required rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Tipo (debe coincidir con el tipo de expediente, si aplica)
          </label>
          <input value={form.tipo} onChange={(e) => set("tipo", e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Orden</label>
          <input type="number" value={form.orden} onChange={(e) => set("orden", e.target.value)} className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Beneficios</label>
          <button type="button" onClick={agregarBeneficio} className="text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:underline">
            + Agregar
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {form.beneficios.map((b, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 border border-brand-line p-3 sm:grid-cols-[140px_1fr_2fr_auto]">
              <select value={b.icono} onChange={(e) => actualizarBeneficio(i, "icono", e.target.value)} className="border border-brand-line bg-brand-ink px-2 py-2 text-xs text-brand-cream outline-none focus:border-brand-gold">
                {ICONOS_BENEFICIO.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <input placeholder="Título" required value={b.titulo} onChange={(e) => actualizarBeneficio(i, "titulo", e.target.value)} className="border border-brand-line bg-transparent px-2 py-2 text-xs text-brand-cream outline-none focus:border-brand-gold" />
              <input placeholder="Texto" required value={b.texto} onChange={(e) => actualizarBeneficio(i, "texto", e.target.value)} className="border border-brand-line bg-transparent px-2 py-2 text-xs text-brand-cream outline-none focus:border-brand-gold" />
              <button type="button" onClick={() => quitarBeneficio(i)} className="border border-brand-goldDeep/60 px-2 text-[10px] uppercase text-brand-gold hover:bg-brand-goldDeep/20">
                Quitar
              </button>
            </div>
          ))}
          {form.beneficios.length === 0 && <p className="text-xs text-brand-creamSoft">Agrega al menos un beneficio.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Pasos del proceso</label>
          <button type="button" onClick={agregarPaso} className="text-[11px] font-semibold uppercase tracking-widest text-brand-gold hover:underline">
            + Agregar
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {form.proceso.map((p, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 border border-brand-line p-3 sm:grid-cols-[70px_1fr_2fr_auto]">
              <input placeholder="01" required value={p.numero} onChange={(e) => actualizarPaso(i, "numero", e.target.value)} className="border border-brand-line bg-transparent px-2 py-2 text-xs text-brand-cream outline-none focus:border-brand-gold" />
              <input placeholder="Título" required value={p.titulo} onChange={(e) => actualizarPaso(i, "titulo", e.target.value)} className="border border-brand-line bg-transparent px-2 py-2 text-xs text-brand-cream outline-none focus:border-brand-gold" />
              <input placeholder="Texto" required value={p.texto} onChange={(e) => actualizarPaso(i, "texto", e.target.value)} className="border border-brand-line bg-transparent px-2 py-2 text-xs text-brand-cream outline-none focus:border-brand-gold" />
              <button type="button" onClick={() => quitarPaso(i)} className="border border-brand-goldDeep/60 px-2 text-[10px] uppercase text-brand-gold hover:bg-brand-goldDeep/20">
                Quitar
              </button>
            </div>
          ))}
          {form.proceso.length === 0 && <p className="text-xs text-brand-creamSoft">Agrega al menos un paso.</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60">
          {saving ? "Guardando…" : form.id ? "Guardar cambios" : "Crear servicio"}
        </button>
        <button type="button" onClick={onCancelar} className="border border-brand-line px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-creamSoft hover:border-brand-goldDeep">
          Cancelar
        </button>
      </div>
    </form>
  );
}
