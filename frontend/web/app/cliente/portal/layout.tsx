"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";

export default function ClientePortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getCookie("ecg_cliente_token");
    if (!token) {
      router.replace("/cliente/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-creamSoft">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
