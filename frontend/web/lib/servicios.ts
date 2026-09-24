// Helpers puros sobre el catálogo de Módulos/Servicios, que ahora vive en BD
// (antes era el arreglo hardcodeado SERVICIOS de este mismo archivo). Los datos
// se obtienen con getModulosActivos()/getServiciosActivos() (lib/api.ts) desde
// cada página/componente (servidor o cliente, según corresponda) y se les
// aplican estos helpers para agrupar/buscar.

import type { Modulo, Servicio } from "./api";

export function getServicioPorSlug(servicios: Servicio[], slug: string): Servicio | undefined {
  return servicios.find((s) => s.slug === slug);
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
