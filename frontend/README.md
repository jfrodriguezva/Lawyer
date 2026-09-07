# EC Abogados — Frontend Web

Portal de gestión de casos para la Lic. Erika Cruz García (EC Abogados),
construido con Next.js (App Router) + TypeScript + Tailwind CSS.

## Requisitos

- Node 24+
- npm 12+
- El API Gateway (Ocelot) del backend corriendo en `http://localhost:5000`
  (o la URL que configures en `.env.local`)

## Puesta en marcha

```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Variables de entorno

Copia `.env.local.example` a `.env.local` y ajusta según tu entorno:

- `NEXT_PUBLIC_API_URL` — URL base del API Gateway (Ocelot), no del backend
  crudo. Por defecto `http://localhost:5000`.

## Notas

- La app espera que el gateway exponga los endpoints de `auth`, `casos`,
  `citas` y `documentos` descritos en `lib/api.ts`.
- La autenticación es simple: el token JWT se guarda en la cookie
  `ec_token` y se envía como `Authorization: Bearer <token>` en cada
  petición desde el navegador.
- Sin backend disponible, las páginas cargan pero las peticiones a la API
  fallarán en tiempo de ejecución (se muestra un mensaje de error en pantalla).
