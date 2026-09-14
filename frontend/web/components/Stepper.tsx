"use client";

// Indicador de pasos reutilizable para formularios largos (agendar cita,
// y cualquier flujo futuro que se divida en pasos). Mantiene la identidad
// visual existente (dorado sobre fondo oscuro) sin depender de una librería.
export default function Stepper({
  pasos,
  actual,
}: {
  pasos: string[];
  actual: number;
}) {
  return (
    <ol className="mb-6 flex items-center gap-1 sm:gap-2">
      {pasos.map((paso, index) => {
        const numero = index + 1;
        const completado = numero < actual;
        const activo = numero === actual;
        return (
          <li key={paso} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  completado
                    ? "border-brand-gold bg-brand-gold text-brand-ink"
                    : activo
                      ? "border-brand-gold text-brand-gold"
                      : "border-brand-line text-brand-creamSoft"
                }`}
              >
                {completado ? "✓" : numero}
              </span>
              <span
                className={`hidden text-center text-[10px] uppercase tracking-widest sm:block ${
                  activo || completado ? "text-brand-cream" : "text-brand-creamSoft/70"
                }`}
              >
                {paso}
              </span>
            </div>
            {numero < pasos.length && (
              <div className={`h-px flex-1 ${completado ? "bg-brand-gold" : "bg-brand-line"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
