# Build context: frontend/web/
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* se hornea en el build (no se puede cambiar luego en runtime),
# por eso entra como build-arg desde docker-compose, no como variable normal.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# La optimización de imágenes de next/image usa sharp, que carga su binario nativo
# con un require dinámico según la plataforma -- el tracer de "output: standalone"
# no lo sigue y lo deja fuera. Sin esto, /_next/image responde 200 pero devuelve
# la imagen original sin comprimir/redimensionar, sin ningún error visible
# (verificado localmente: falla en silencio, no con un error que se note).
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
