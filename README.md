# ECG Abogados

Sistema de gestión para el despacho de la Lic. Erika Cruz García: derecho familiar (divorcio incausado, pensión alimenticia, custodia, sucesiones), trámites fiscales ante el SAT y asesoría empresarial. Incluye un sitio público de captación, un portal de cliente y un panel administrativo privado para gestionar casos, citas, documentos y mensajes de contacto.

## Estructura del repositorio

```
Lawyer/
├── backend/    → API en .NET 10 (Clean Architecture) + Gateway (Ocelot) + esquema SQL Server
├── frontend/   → Aplicación web en Next.js 16 (App Router) + React 19 + Tailwind 4
└── docs/       → Documentación funcional y técnica del proyecto
```

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md) | Cómo usar el sitio público y el panel interno |
| [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md) | Arquitectura, endpoints, base de datos, cómo levantar el entorno |
| [`docs/EVALUACION_FUNCIONAL.md`](docs/EVALUACION_FUNCIONAL.md) | Evaluación de madurez, UX, complejidad e impacto de negocio |
| [`RECOVERY.md`](RECOVERY.md) | Contexto de recuperación del proyecto para continuar el trabajo en otra sesión/chat |

## Arranque rápido

**Requisitos:** .NET 10 SDK, Node.js 20+, SQL Server (local o remoto).

```bash
# 1. Base de datos (schema.sql está en UTF-8: usar -f 65001 para no corromper acentos/ñ)
sqlcmd -S localhost -i backend/database/schema.sql -f 65001

# 2. API (http://localhost:5080)
cd backend/src/ECAbogados.Api
dotnet run

# 3. Gateway — opcional (http://localhost:5000)
cd backend/src/ECAbogados.Gateway
dotnet run

# 4. Frontend (http://localhost:3000)
cd frontend/web
npm install
npm run dev
```

Credenciales semilla del panel: `erika@ecabogados.mx` / `Cambiar123!`

Ver el detalle completo de configuración, variables de entorno y solución de problemas en [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md).
