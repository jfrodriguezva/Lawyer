// Helpers puros sobre el catálogo de Módulos/Servicios, que ahora vive en BD
// (antes era el arreglo hardcodeado SERVICIOS de este mismo archivo). Los datos
// se obtienen con getCatalogoPublico() (lib/api.ts) desde
// cada página/componente (servidor o cliente, según corresponda) y se les
// aplican estos helpers para agrupar/buscar.

import type { Modulo, Servicio } from "./api";

export function getServicioPorSlug(servicios: Servicio[], slug: string): Servicio | undefined {
  return servicios.find((s) => s.slug === slug);
}

// El "módulo SAT" es el que atiende el rol Consultor (se identifica por rol y no
// por slug, porque el Administrador puede renombrar el módulo). Su Activo es la
// única fuente de verdad para todo lo SAT: el sitio público, la opción "Trámite
// SAT" del formulario de citas y el menú del Consultor. Antes esto último
// dependía de un flag aparte (Configuracion.sat_habilitado) que podía quedar
// desincronizado del módulo.
export function getModuloSat(modulos: Modulo[]): Modulo | undefined {
  return modulos.find((m) => m.rolResponsable === "Consultor");
}

export function satActivo(modulos: Modulo[]): boolean {
  return getModuloSat(modulos)?.activo ?? false;
}

export interface GrupoModuloServicios {
  modulo: Modulo;
  servicios: Servicio[];
}

// Agrupa los servicios activos por Módulo (en el orden de los módulos),
// fuente única de verdad para el menú de navegación, la home y /servicios.
export function agruparPorModulo(modulos: Modulo[], servicios: Servicio[]): GrupoModuloServicios[] {
  return modulos.map((modulo) => ({
    modulo,
    servicios: servicios.filter((s) => s.moduloId === modulo.id),
  }));
}
