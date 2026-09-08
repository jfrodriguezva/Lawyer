"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Monogram from "@/components/Monogram";
import { login, ApiError } from "@/lib/api";
import { setCookie } from "@/lib/cookies";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setCookie("ec_token", res.token);
      setCookie("ec_user", JSON.stringify({ nombre: res.nombre, rol: res.rol, email: res.email }));
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Correo o contraseña incorrectos.");
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
            EC ABOGADOS
          </h1>
          <p className="mt-2 font-script text-base italic text-brand-gold">
            Tu libertad también es un derecho
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold"
              placeholder="nombre@ecabogados.mx"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:text-brand-gold"
        >
          ← Volver al sitio
        </Link>
      </div>
    </main>
  );
}
