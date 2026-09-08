"use client";

import { useEffect, useState, type FormEvent } from "react";
import { cambiarEstatusUsuario, crearUsuario, getUsuarios, type Usuario } from "@/lib/api";
import { getCookie } from "@/lib/cookies";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [miCorreo, setMiCorreo] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("Asistente");

  function load() {
    setLoading(true);
    getUsuarios()
      .then(setUsuarios)
      .catch(() => setError("No se pudo cargar el equipo. ¿Tu cuenta tiene rol Administrador?"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        setMiCorreo(JSON.parse(raw).email ?? null);
      } catch {
        // ignore malformed cookie
      }
    }
  }, []);

  async function handleToggleActivo(usuario: Usuario) {
    try {
      await cambiarEstatusUsuario(usuario.id, !usuario.activo);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, activo: !usuario.activo } : u))
      );
    } catch {
      setError("No se pudo actualizar el estatus del usuario.");
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await crearUsuario({ email, password, nombre, rol });
      setEmail("");
      setPassword("");
      setNombre("");
      setRol("Asistente");
      load();
    } catch {
      setError("No se pudo crear el usuario (puede que el correo ya exista).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Equipo del despacho</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Usuarios</h1>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-8 grid grid-cols-1 gap-4 border border-brand-line bg-brand-ink2 p-6 sm:grid-cols-2"
      >
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Nombre
          </label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Correo
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Contraseña temporal
          </label>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            Rol
          </label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          >
            <option value="Asistente">Asistente</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>

      <div className="mt-8 border border-brand-line">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
          <span>Nombre</span>
          <span>Correo</span>
          <span>Rol</span>
          <span>Estatus</span>
          <span>Acciones</span>
        </div>
        {loading && <p className="px-5 py-6 text-sm text-brand-creamSoft">Cargando…</p>}
        {!loading &&
          usuarios.map((u) => {
            const esMiCuenta = u.email === miCorreo;
            return (
              <div
                key={u.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-brand-line px-5 py-4 text-sm text-brand-cream last:border-b-0"
              >
                <span className="font-medium">{u.nombre}</span>
                <span className="text-brand-creamSoft">{u.email}</span>
                <span className="text-brand-creamSoft">{u.rol}</span>
                <span className={u.activo ? "text-brand-gold" : "text-brand-creamSoft/60"}>
                  {u.activo ? "Activo" : "Desactivado"}
                </span>
                <button
                  onClick={() => handleToggleActivo(u)}
                  disabled={esMiCuenta && u.activo}
                  title={esMiCuenta && u.activo ? "No puedes desactivar tu propia cuenta" : undefined}
                  className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
