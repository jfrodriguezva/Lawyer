"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Monogram from "@/components/Monogram";
import { login, olvidePassword, ApiError } from "@/lib/api";
import { setCookie } from "@/lib/cookies";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "olvide">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [olvideEmail, setOlvideEmail] = useState("");
  const [olvideEnviado, setOlvideEnviado] = useState(false);
  const [olvideLoading, setOlvideLoading] = useState(false);

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
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Demasiados intentos. Espera un minuto e inténtalo de nuevo.");
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOlvidePassword(e: FormEvent) {
    e.preventDefault();
    setOlvideLoading(true);
    try {
      await olvidePassword(olvideEmail);
      setOlvideEnviado(true);
    } catch {
      // Siempre mostramos éxito: el backend no revela si el correo existe.
      setOlvideEnviado(true);
    } finally {
      setOlvideLoading(false);
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

        {modo === "login" ? (
          <>
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

            <button
              type="button"
              onClick={() => setModo("olvide")}
              className="mt-4 block w-full text-center text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:text-brand-gold"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        ) : (
          <div className="mt-10">
            {olvideEnviado ? (
              <p className="border border-brand-gold/50 bg-brand-gold/10 px-4 py-4 text-center text-sm text-brand-cream">
                Si ese correo existe en el sistema, te enviamos un enlace para restablecer tu
                contraseña. Revisa tu bandeja de entrada.
              </p>
            ) : (
              <form onSubmit={handleOlvidePassword} className="space-y-5">
                <p className="text-center text-sm text-brand-creamSoft">
                  Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <div>
                  <label
                    htmlFor="olvide-email"
                    className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="olvide-email"
                    type="email"
                    required
                    value={olvideEmail}
                    onChange={(e) => setOlvideEmail(e.target.value)}
                    className="mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold"
                    placeholder="nombre@ecabogados.mx"
                  />
                </div>
                <button
                  type="submit"
                  disabled={olvideLoading}
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {olvideLoading ? "Enviando…" : "Enviar enlace"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setModo("login");
                setOlvideEnviado(false);
              }}
              className="mt-4 block w-full text-center text-xs uppercase tracking-widest text-brand-creamSoft transition-colors hover:text-brand-gold"
            >
              ← Volver a iniciar sesión
            </button>
          </div>
        )}

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
