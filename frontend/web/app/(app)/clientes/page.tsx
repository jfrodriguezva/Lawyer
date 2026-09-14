"use client";

import { useEffect, useState, type FormEvent } from "react";
import { cambiarEstatusCliente, crearCliente, getClientes, invitarCliente, type Cliente } from "@/lib/api";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modo, setModo] = useState<"invitar" | "directo">("invitar");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

  function load() {
    setLoading(true);
    getClientes()
      .then(setClientes)
      .catch(() => setError("No se pudo cargar la lista de clientes."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggleActivo(cliente: Cliente) {
    try {
      await cambiarEstatusCliente(cliente.id, !cliente.activo);
      setClientes((prev) =>
        prev.map((c) => (c.id === cliente.id ? { ...c, activo: !cliente.activo } : c))
      );
    } catch {
      setError("No se pudo actualizar el estatus del cliente.");
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (modo === "invitar") {
        await invitarCliente({ email, nombre });
      } else {
        await crearCliente({ email, password, nombre });
      }
      setEmail("");
      setPassword("");
      setNombre("");
      load();
    } catch {
      setError("No se pudo dar de alta al cliente (puede que el correo ya exista).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="font-script text-lg italic text-brand-gold">Portal del cliente</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-brand-cream">Clientes</h1>
      <p className="mt-2 text-sm text-brand-creamSoft">
        Cuentas con acceso al portal autenticado, donde el cliente ve el seguimiento de su(s) expediente(s). Vincula
        cada cuenta a un caso desde el detalle del expediente.
      </p>

      {error && (
        <p className="mt-6 border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
          {error}
        </p>
      )}

      <div className="mt-8 border border-brand-line bg-brand-ink2 p-6">
        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setModo("invitar")}
            className={`border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
              modo === "invitar" ? "border-brand-gold text-brand-gold" : "border-brand-line text-brand-creamSoft hover:border-brand-gold"
            }`}
          >
            Enviar invitación segura
          </button>
          <button
            type="button"
            onClick={() => setModo("directo")}
            className={`border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
              modo === "directo" ? "border-brand-gold text-brand-gold" : "border-brand-line text-brand-creamSoft hover:border-brand-gold"
            }`}
          >
            Crear con contraseña
          </button>
        </div>
        <p className="mb-4 text-xs text-brand-creamSoft">
          {modo === "invitar"
            ? "El cliente recibirá un correo con un enlace de un solo uso para establecer su propia contraseña."
            : "Tú defines la contraseña temporal; compártela con el cliente por un medio seguro."}
        </p>

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          {modo === "directo" && (
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
          )}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-brand-gold to-brand-goldDeep px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Guardando…" : modo === "invitar" ? "Enviar invitación" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto border border-brand-line">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 border-b border-brand-line px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Estatus</span>
            <span>Acciones</span>
          </div>
          {loading && <p className="px-5 py-6 text-sm text-brand-creamSoft">Cargando…</p>}
          {!loading && clientes.length === 0 && (
            <p className="px-5 py-6 text-sm text-brand-creamSoft">Aún no hay clientes con cuenta en el portal.</p>
          )}
          {!loading &&
            clientes.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[2fr_2fr_1fr_auto] items-center gap-4 border-b border-brand-line px-5 py-4 text-sm text-brand-cream last:border-b-0"
              >
                <span className="font-medium">{c.nombre}</span>
                <span className="text-brand-creamSoft">{c.email}</span>
                <span className={c.activo ? "text-brand-gold" : "text-brand-creamSoft/60"}>
                  {c.invitacionPendiente ? "Invitación enviada" : c.activo ? "Activo" : "Desactivado"}
                </span>
                <button
                  onClick={() => handleToggleActivo(c)}
                  className="border border-brand-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-creamSoft transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  {c.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
