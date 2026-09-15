import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  agentRules: false,
  // Empaqueta solo lo necesario para correr `node server.js` en producción
  // (usado por el Dockerfile de despliegue), en vez de requerir node_modules
  // completo dentro de la imagen.
  output: "standalone",
};

export default nextConfig;
