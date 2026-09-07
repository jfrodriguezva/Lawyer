import type { MetadataRoute } from "next";
import { SERVICIOS } from "@/lib/servicios";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), priority: 1 },
  ];

  const paginasServicios: MetadataRoute.Sitemap = SERVICIOS.map((s) => ({
    url: `${siteUrl}/servicios/${s.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  return [...paginasEstaticas, ...paginasServicios];
}
