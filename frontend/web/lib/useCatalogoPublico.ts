import { useEffect, useState } from "react";
import { getCatalogoPublico, type CatalogoPublico } from "./api";

const TTL_MS = 30_000;

const VACIO: CatalogoPublico = { modulos: [], servicios: [], promociones: [] };

// GuestHeader y LandingExperience necesitan el mismo catálogo público y se
// montan juntos en la home -- sin este cache en memoria del navegador, cada uno
// disparaba su propio fetch (era la mitad de las "6 peticiones en una sola
// carga" que agotaban el rate limit, ver Program.cs). `enVuelo` deduplica
// llamadas que se solapan (ambos componentes montando en el mismo instante);
// `cache` evita repetir la petición si el usuario navega entre páginas del
// sitio público dentro de los 30s.
let cache: { datos: CatalogoPublico; expiraEn: number } | null = null;
let enVuelo: Promise<CatalogoPublico> | null = null;

function obtenerCatalogoPublico(): Promise<CatalogoPublico> {
  if (cache && cache.expiraEn > Date.now()) {
    return Promise.resolve(cache.datos);
  }

  if (!enVuelo) {
    enVuelo = getCatalogoPublico()
      .then((datos) => {
        cache = { datos, expiraEn: Date.now() + TTL_MS };
        return datos;
      })
      .finally(() => {
        enVuelo = null;
      });
  }

  return enVuelo;
}

export function useCatalogoPublico(): CatalogoPublico {
  const [catalogo, setCatalogo] = useState<CatalogoPublico>(cache?.datos ?? VACIO);

  useEffect(() => {
    let vigente = true;
    obtenerCatalogoPublico().then((datos) => {
      if (vigente) setCatalogo(datos);
    }).catch(() => undefined);
    return () => {
      vigente = false;
    };
  }, []);

  return catalogo;
}
