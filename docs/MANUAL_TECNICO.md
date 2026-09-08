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

| Plazos | `GET /plazos/caso/{casoId}` | JWT | Listar plazos/audiencias de un caso |
| | `POST /plazos` | JWT | Crear plazo |
| | `PATCH /plazos/{id}/cumplido` | JWT | Marcar cumplido |
| Pagos | `GET /pagos/caso/{casoId}` | JWT (**Administrador**) | Listar honorarios de un caso |
| | `POST /pagos` | JWT (**Administrador**) | Registrar pago |
| Usuarios | `GET /usuarios` | JWT (**Administrador**) | Listar personal |
| | `POST /usuarios` | JWT (**Administrador**) | Alta de personal (Asistente/Administrador) |
| Portal | `GET /portal/{token}` | Anónimo | Datos del caso vía enlace mágico (expira a los 180 días) |
| | `POST /portal/{token}/documentos` | Anónimo | Subida de documento por el cliente |
| Casos | `PATCH /casos/checklist/{itemId}` | JWT | Marcar requisito del checklist |
| | `POST /casos/{id}/regenerar-token` | JWT (**Administrador**) | Invalida el enlace del portal actual y genera uno nuevo |
| Usuarios | `PATCH /usuarios/{id}/estatus` | JWT (**Administrador**) | Activar/desactivar una cuenta de personal |

Swagger UI disponible en `http://localhost:5080/swagger`.

## 4.1 Roles y autorización

El JWT incluye el claim de rol (`Administrador` o `Asistente`). Restricciones aplicadas a nivel de controller:
- Cerrar un expediente (`PATCH /casos/{id}/estatus` con `Cerrado`) requiere rol `Administrador` (verificación inline en `CasosController`).
- Todo el controller de `Pagos` y `Usuarios` requiere `[Authorize(Roles = "Administrador")]`.

## 4.2 Notificaciones por correo (gratis)

`IEmailSender` (Infrastructure/Notifications/SmtpEmailSender.cs) usa `System.Net.Mail.SmtpClient`, incluido en .NET — sin paquetes ni costo adicional. Si `Smtp:Host` está vacío en `appsettings.json`, los correos solo se registran en el log de la API (modo desarrollo). Para activarlos de verdad, configura una cuenta gratuita:

- **Gmail**: activa verificación en 2 pasos y genera una "contraseña de aplicación" en https://myaccount.google.com/apppasswords. `Smtp:Host` = `smtp.gmail.com`, puerto `587`.
- **Brevo (ex Sendinblue)**: plan gratuito de 300 correos/día, sin tarjeta. https://www.brevo.com

Configura también `Notificaciones:StaffEmail` con el correo del despacho que debe recibir los avisos (mensajes nuevos, citas nuevas, recordatorio de citas a 24h, alertas de plazos a 3 días). El envío corre en `RecordatorioBackgroundService`, un `BackgroundService` nativo de .NET (sin Hangfire) que revisa cada 30 minutos.

## 4.3 Analítica y SEO (gratis)

- Define `NEXT_PUBLIC_GA_ID` (Google Analytics 4, gratis) y/o `NEXT_PUBLIC_META_PIXEL_ID` (Meta Pixel, gratis) en `frontend/web/.env.local` para activar el tracking en el sitio público; si se dejan vacíos, no se carga ningún script.
- `NEXT_PUBLIC_SITE_URL` controla el dominio usado en `sitemap.xml`, `robots.txt` y metadatos OpenGraph.
- El sitio ya expone `/sitemap.xml`, `/robots.txt` y datos estructurados `schema.org/Attorney` en la portada.

## 4.4 Portal del cliente

Cada caso genera un `TokenAcceso` (GUID) al crearse. El link `{sitio}/portal/{token}` (sin login) muestra estatus, checklist y documentos del caso, y permite subir nuevos documentos. Está pensado para compartirse por WhatsApp.

El enlace **expira a los 180 días** de generado (`ObtenerCasoPorTokenQueryHandler`, constante `VigenciaToken`): pasado ese tiempo el portal responde como si el caso no existiera. El botón "Regenerar enlace" en `/casos/{id}` (solo `Administrador`) invalida el link anterior de inmediato y genera uno nuevo — útil también si el enlace se compartió por error.

## 4.5 Mediador propio (sin MediatR)

El proyecto usaba **MediatR 14.2.0**, que a partir de cierto release requiere licencia comercial de pago (Lucky Penny Software) para producción. Se reemplazó por una implementación propia y gratuita en `ECAbogados.Application/Mediation/`:

- `IRequest` / `IRequest<TResponse>`: mismas marcas que usaban los Commands/Queries.
- `IRequestHandler<TRequest>` / `IRequestHandler<TRequest, TResponse>`: mismo contrato que implementan los handlers existentes.
- `ISender` / `Sender`: resuelve el handler correspondiente vía el contenedor de DI de ASP.NET Core y lo invoca por reflexión (`serviceProvider.GetRequiredService(handlerType)` + `MethodInfo.Invoke`).

El registro de handlers es manual y explícito en `ECAbogados.Application/DependencyInjection.cs`: escanea el propio ensamblado de Application buscando clases que implementen `IRequestHandler<>`/`IRequestHandler<,>` y las da de alta contra su interfaz — sin ninguna librería de terceros ni dependencia de licencia. Todos los Commands, Queries, Handlers y Controllers existentes siguen igual (solo cambió el `using`, de `MediatR` a `ECAbogados.Application.Mediation`); el comportamiento es idéntico y fue verificado end-to-end (login, CRUD de casos con checklist, plazos, pagos, usuarios, portal por token, restricciones de rol).

## 4.6 Activar/desactivar personal

`Usuarios.Activo` (BIT, default `1`). Un login con `Activo = 0` responde igual que credenciales inválidas (no revela que la cuenta existe). `PATCH /usuarios/{id}/estatus` (solo `Administrador`) activa o desactiva; el propio controller bloquea que un administrador se desactive a sí mismo (comparando el `id` contra el `ClaimTypes.NameIdentifier` del JWT).

## 4.7 Pruebas automatizadas y CI

- `backend/tests/ECAbogados.Application.Tests`: proyecto xUnit con **fakes escritos a mano** (sin Moq/NSubstitute) para los repositorios — mismo espíritu "manual" que el mediador propio. Cubre `LoginCommandHandler` (éxito, password incorrecto, usuario inactivo), `CrearCasoCommandHandler` (checklist auto-generado), `CambiarEstatusCasoCommandHandler`, `CrearUsuarioCommandHandler` (email duplicado) y el propio `Sender`/registro de `AddApplication()`. Correr con `dotnet test backend/ECAbogados.sln`.
- `.github/workflows/ci.yml`: GitHub Actions (gratis en repos públicos) — build + test del backend y lint + build del frontend en cada push/PR a `main`. No requiere SQL Server real (tests unitarios contra fakes en memoria).

## 4. Autenticación

- JWT Bearer emitido en `/auth/login` tras verificar la contraseña con **BCrypt** contra `Usuarios.PasswordHash`, y que la cuenta esté `Activo`.
- Configuración en `backend/src/ECAbogados.Api/appsettings.json`: `Jwt:Issuer`, `Audience`, `ExpiryMinutes` (480 min = 8 h). **`Jwt:Secret` ya no se commitea** (queda `""` en el repo); `Program.cs` falla explícitamente al arrancar si no hay un valor real.
  - **Desarrollo**: `dotnet user-secrets set "Jwt:Secret" "<valor-aleatorio>"` desde `backend/src/ECAbogados.Api` (ya configurado en esta máquina; cada desarrollador nuevo debe correrlo una vez).
  - **Cualquier otro ambiente**: variable de entorno `Jwt__Secret` (doble guion bajo, convención de ASP.NET Core para configuración anidada).
- El frontend guarda el token en la cookie `ec_token` y lo envía como `Authorization: Bearer <token>` en cada request (`frontend/web/lib/api.ts`).
- El guard de rutas del panel (`app/(app)/layout.tsx`) solo verifica la **presencia** de la cookie del lado del cliente; no valida expiración ni firma en el navegador (la API sí la valida en cada request).

## 5. Base de datos

SQL Server. Esquema completo en `backend/database/schema.sql`.

**Tablas:** `Usuarios`, `Casos`, `Citas`, `Documentos`, `MensajesContacto`, `ChecklistItems`, `Plazos`, `Pagos`.

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
├── portal/[token]/page.tsx → portal del cliente (enlace mágico, sin login)
├── servicios/[slug]/page.tsx → landings de servicio (pensión, custodia, etc.)
├── sitemap.ts / robots.ts  → SEO nativo de Next.js
└── (app)/                  → grupo de rutas protegidas
    ├── layout.tsx           → guard: redirige a /login si no hay cookie ec_token
    ├── dashboard/page.tsx
    ├── casos/page.tsx
    ├── casos/[id]/page.tsx
    ├── agenda/page.tsx
    ├── mensajes/page.tsx
    └── usuarios/page.tsx    → solo Administrador
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

# 2. Configurar el secreto JWT (una sola vez por máquina de desarrollo)
cd backend/src/ECAbogados.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Secret" "<genera-un-valor-aleatorio-largo>"

# 3. Levantar la API
dotnet run                       # http://localhost:5080

# 4. (Opcional) Levantar el Gateway
cd backend/src/ECAbogados.Gateway
dotnet run                       # http://localhost:5000

# 5. Levantar el frontend
cd frontend/web
npm install
npm run dev                      # http://localhost:3000
```

CORS está configurado en la API y el Gateway solo para permitir `http://localhost:3000`.

## 8. Limitaciones técnicas conocidas

- Almacenamiento de documentos en disco local del servidor de la API — no apto para múltiples instancias sin un volumen persistente compartido (relevante al planear el despliegue a Azure: considerar Blob Storage).
- Sin auditoría/histórico de cambios sobre casos, citas o documentos.
- Edición de datos de un usuario (nombre, rol, contraseña) no expuesta vía API — solo alta, listado y activar/desactivar. Cambios de esos campos siguen requiriendo SQL directo.
- Cobertura de pruebas automatizadas es representativa, no exhaustiva (ver 4.7).
