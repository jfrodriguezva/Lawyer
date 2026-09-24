import type { MetadataRoute } from "next";
import { getServiciosActivos } from "@/lib/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Sin esto, `next build` intenta generar /sitemap.xml en build time y falla si
// la API no está corriendo en ese momento (por ejemplo, al construir la imagen
// Docker del frontend antes de levantar el backend). Se genera en cada request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), priority: 1 },
  ];

  const servicios = await getServiciosActivos();
  const paginasServicios: MetadataRoute.Sitemap = servicios.map((s) => ({
    url: `${siteUrl}/servicios/${s.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  return [...paginasEstaticas, ...paginasServicios];
}
