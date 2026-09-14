"use client";

import { useEffect, useState, type FormEvent } from "react";
import { actualizarMiPerfil, ApiError } from "@/lib/api";
import { getCookie, setCookie } from "@/lib/cookies";

export default function PerfilPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const raw = getCookie("ec_user");
    if (raw) {
      try {
        const usuario = JSON.parse(raw);
        setNombre(usuario.nombre ?? "");
        setEmail(usuario.email ?? "");
        setRol(usuario.rol ?? "");
      } catch {
        // ignore malformed cookie
      }
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setExito(false);
    try {
      await actualizarMiPerfil({
        nombre,
        passwordActual: nuevaPassword ? passwordActual : null,
        nuevaPassword: nuevaPassword || null,
      });

      const raw = getCookie("ec_user");
      if (raw) {
        try {
          const usuario = JSON.parse(raw);
          setCookie("ec_user", JSON.stringify({ ...usuario, nombre }));
        } catch {
          // ignore
        }
      }

      setPasswordActual("");
      setNuevaPassword("");
      setExito(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar tu perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <p className="font-script text-lg italic text-brand-gold">Tu cuenta</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Mi perfil</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">{email} · {rol}</p>

      {exito && (
        <p className="mt-6 border border-brand-gold/50 bg-brand-gold/10 px-4 py-3 text-sm text-brand-cream">
          Tus datos se actualizaron correctamente.
        </p>
      )}
      {error && <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 border border-brand-line bg-brand-ink2 p-6">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Nombre</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>

        <hr className="border-brand-line" />
        <p className="text-xs text-brand-creamSoft">Deja estos campos vacíos si no quieres cambiar tu contraseña.</p>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Contraseña actual</label>
          <input
            type="password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">Nueva contraseña</label>
          <input
            type="password"
            minLength={8}
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none focus:border-brand-gold"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
