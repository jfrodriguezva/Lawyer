# Manual técnico — EC Abogados

## 1. Arquitectura general

```
Navegador → Frontend Next.js (:3000) → Gateway Ocelot (:5000) → API .NET (:5080) → SQL Server
```

El frontend (`lib/api.ts`) apunta por defecto a `http://localhost:5000` (o a `NEXT_PUBLIC_API_URL` si está definida), es decir, normalmente pasa por el **Gateway**, que enruta cada `/api/*` hacia la API real en `localhost:5080`. La API también puede consumirse directamente sin pasar por el Gateway.

## 2. Backend — `ECAbogados` (.NET 10, Clean Architecture)

5 proyectos en `backend/src/`:

| Proyecto | Responsabilidad |
|---|---|
| `ECAbogados.Domain` | Entidades puras: `Caso`, `Cita`, `Documento`, `Usuario`, `MensajeContacto` + enums `EstatusCaso`, `EstatusCita`. Sin dependencias externas. |
| `ECAbogados.Application` | Lógica de negocio con CQRS vía **MediatR**: Commands/Queries/Handlers/Validators organizados por feature (`Casos`, `Citas`, `Documentos`, `Auth`, `Contacto`), DTOs e interfaces de repositorio. |
| `ECAbogados.Infrastructure` | Implementación de repositorios sobre SQL Server (`SqlConnectionFactory`, políticas de resiliencia con Polly), `BcryptPasswordHasher`, `JwtTokenGenerator`. |
| `ECAbogados.Api` | API REST (ASP.NET Core Web API): Controllers, JWT Bearer auth, Swagger, CORS. Escucha en `http://localhost:5080`. |
| `ECAbogados.Gateway` | API Gateway con **Ocelot**, enruta `/api/*` hacia la API. Escucha en `http://localhost:5000`. |

Patrón por feature dentro de `Application`, por ejemplo `Casos/Commands/CrearCaso/`: `CrearCasoCommand` + `CrearCasoCommandHandler` + `CrearCasoCommandValidator`.

## 3. Endpoints de la API

Base: `/api`

| Recurso | Método/Ruta | Auth | Descripción |
|---|---|---|---|
| Auth | `POST /auth/login` | Anónimo | Devuelve JWT + datos de usuario |
| Casos | `GET /casos` | JWT | Listar |
| | `GET /casos/{id}` | JWT | Detalle |
| | `POST /casos` | JWT | Crear |
| | `PUT /casos/{id}` | JWT | Actualizar cliente/tipo/notas |
| | `PATCH /casos/{id}/estatus` | JWT | Cambiar estatus |
| Citas | `GET /citas` | JWT | Listar |
| | `POST /citas` | Anónimo | Crear (usado por el sitio público) |
| | `PATCH /citas/{id}/estatus` | JWT | Confirmar/cancelar |
| Documentos | `GET /documentos/caso/{casoId}` | JWT | Listar por caso |
| | `POST /documentos` (multipart, máx. 50 MB) | JWT | Subir archivo |
| Contacto | `POST /contacto` | Anónimo | Crear mensaje (formulario público) |
| | `GET /contacto` | JWT | Listar mensajes |
| | `PATCH /contacto/{id}/atendido` | JWT | Marcar atendido |

Swagger UI disponible en `http://localhost:5080/swagger`.

## 4. Autenticación

- JWT Bearer emitido en `/auth/login` tras verificar la contraseña con **BCrypt** contra `Usuarios.PasswordHash`.
- Configuración en `backend/src/ECAbogados.Api/appsettings.json`: `Jwt:Secret`, `Issuer`, `Audience`, `ExpiryMinutes` (480 min = 8 h).
- ⚠️ El secreto de desarrollo está en texto plano en el repo — **debe reemplazarse por un valor seguro fuera del control de versiones antes de producción** (variable de entorno o secret manager).
- El frontend guarda el token en la cookie `ec_token` y lo envía como `Authorization: Bearer <token>` en cada request (`frontend/web/lib/api.ts`).
- El guard de rutas del panel (`app/(app)/layout.tsx`) solo verifica la **presencia** de la cookie del lado del cliente; no valida expiración ni firma en el navegador (la API sí la valida en cada request).

## 5. Base de datos

SQL Server. Esquema completo en `backend/database/schema.sql`.

**Tablas:** `Usuarios`, `Casos`, `Citas`, `Documentos`, `MensajesContacto`.

El script es idempotente (usa `IF NOT EXISTS`) e incluye datos semilla:
- Usuario administrador: `erika@ecabogados.mx` / contraseña `Cambiar123!` (hash bcrypt ya incluido).
- 2 casos y 2 citas de ejemplo para poblar el dashboard.

Cadena de conexión por defecto (`ConnectionStrings:Default`):
```
Server=localhost;Database=ECAbogados;Trusted_Connection=True;TrustServerCertificate=True;
```

Los documentos subidos se guardan en **disco**, no en la base de datos ni en blob storage:
```
backend/src/ECAbogados.Api/App_Data/documentos/{casoId}/{guid}_{nombreArchivo}
```
La tabla `Documentos` solo referencia `RutaAlmacenamiento`.

## 6. Frontend — Next.js 16 (App Router) + React 19 + Tailwind 4

```
frontend/web/app/
├── page.tsx                → landing pública
├── login/page.tsx          → login
└── (app)/                  → grupo de rutas protegidas
    ├── layout.tsx           → guard: redirige a /login si no hay cookie ec_token
    ├── dashboard/page.tsx
    ├── casos/page.tsx
    ├── casos/[id]/page.tsx
    ├── agenda/page.tsx
    └── mensajes/page.tsx
```

- `lib/api.ts`: cliente HTTP centralizado (fetch wrapper), define los tipos TS (`Caso`, `Cita`, `Documento`, `MensajeContacto`), inyecta el JWT y maneja errores (`ApiError`).
- `lib/cookies.ts`: helpers `getCookie`/`setCookie` para persistir `ec_token` y `ec_user`.
- Sin gestor de estado global ni librería de fetching (no Redux/React Query): cada página usa `useState`/`useEffect` + llamadas directas a `lib/api.ts`.
- Estilo: Tailwind CSS 4 con paleta de marca personalizada (`brand-ink`, `brand-gold`, etc.).

## 7. Cómo levantar el proyecto localmente

**Requisitos:** .NET 10 SDK, Node.js 20+, SQL Server accesible (local o remoto) con autenticación de Windows o cadena de conexión ajustada.

```bash
# 1. Crear la base de datos y datos semilla
sqlcmd -S localhost -i backend/database/schema.sql

# 2. Levantar la API
cd backend/src/ECAbogados.Api
dotnet run                       # http://localhost:5080

# 3. (Opcional) Levantar el Gateway
cd backend/src/ECAbogados.Gateway
dotnet run                       # http://localhost:5000

# 4. Levantar el frontend
cd frontend/web
npm install
npm run dev                      # http://localhost:3000
```

CORS está configurado en la API y el Gateway solo para permitir `http://localhost:3000`.

## 8. Limitaciones técnicas conocidas

- Secreto JWT hardcodeado en `appsettings.json` (solo válido para desarrollo).
- No hay gestión de usuarios vía API (altas/bajas de personal requieren acceso directo a SQL).
- No hay pruebas automatizadas (unitarias/integración) en el repo.
- No hay pipeline de CI/CD configurado.
- Almacenamiento de documentos en disco local del servidor de la API (no apto para múltiples instancias o despliegue sin volumen persistente compartido).
- Sin auditoría/histórico de cambios sobre casos, citas o documentos.
