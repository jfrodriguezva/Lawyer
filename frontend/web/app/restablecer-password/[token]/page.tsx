"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Monogram from "@/components/Monogram";
import { restablecerPassword, ApiError } from "@/lib/api";

export default function RestablecerPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (nuevaPassword !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await restablecerPassword(params.token, nuevaPassword);
      setListo(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "El enlace no es válido o ya expiró.");
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-ink px-4">
      <div className="w-full max-w-md border border-brand-line bg-brand-ink2 px-10 py-12">
        <div className="flex flex-col items-center text-center">
          <Monogram size={56} />
          <h1 className="mt-5 font-display text-2xl font-bold tracking-wide text-brand-cream">
            Restablecer contraseña
          </h1>
        </div>

        {listo ? (
          <div className="mt-8 space-y-6">
            <p className="border border-brand-gold/50 bg-brand-gold/10 px-4 py-4 text-center text-sm text-brand-cream">
              Tu contraseña se actualizó correctamente.
            </p>
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label
                htmlFor="nueva-password"
                className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft"
              >
                Nueva contraseña
              </label>
              <input
                id="nueva-password"
                type="password"
                required
                minLength={8}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmar-password"
                className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmar-password"
                type="password"
                required
                minLength={8}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-2.5 text-sm text-brand-gold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Guardando…" : "Guardar nueva contraseña"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-6 block text-center text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:text-brand-gold"
        >
          ← Volver a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
