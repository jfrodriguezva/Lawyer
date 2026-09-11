# RECOVERY.md — Contexto de recuperación del proyecto

> Este archivo existe para que, si esta conversación se pierde o se retoma el trabajo en otro chat/sesión de Claude, se pueda reconstruir el contexto completo sin tener que re-explorar todo el repositorio desde cero. Léelo primero.

## ¿Qué es este proyecto?

**ECG Abogados** (renombrado desde "EC Abogados" el 2026-09-11, ver batch más reciente abajo): sistema de gestión para el despacho de la Lic. Erika Cruz García — derecho familiar, trámites fiscales ante el SAT y asesoría empresarial (11 servicios en total). Landing pública de captación + panel administrativo privado (casos, citas, documentos, mensajes de contacto) + portal de Cliente autenticado (cuenta real, además del portal anónimo por enlace mágico que ya existía).

Documentación completa:
- [`README.md`](README.md) — arranque rápido
- [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md) — cómo se usa
- [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md) — arquitectura, endpoints, BD
- [`docs/EVALUACION_FUNCIONAL.md`](docs/EVALUACION_FUNCIONAL.md) — evaluación de madurez/mercado (legal, ingeniería, UX, integraciones)

## Ubicación y stack

- **Ruta local:** `C:\jfrodriguezv\SourceCodeAnthropic\Personal\Lawyer`
- **Repo GitHub:** `https://github.com/jfrodriguezva/Lawyer.git`
- **Backend:** .NET 10 SDK, Clean Architecture (Domain/Application/Infrastructure/Api) + Gateway con Ocelot. Solución: `backend/ECAbogados.sln`.
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind 4, en `frontend/web/`.
- **Base de datos:** SQL Server, esquema en `backend/database/schema.sql` (idempotente, con seed).

## Estado del entorno local (última sesión de trabajo)

- Base de datos `ECAbogados` creada en SQL Server local (`localhost`, autenticación de Windows) ejecutando `schema.sql`.
- Usuario admin semilla verificado y funcional:
  - Email: `erika@ecabogados.mx`
  - Password: `Cambiar123!`
- Se levantaron y probaron con éxito (login end-to-end):
  - API en `http://localhost:5080` (`dotnet run` desde `backend/src/ECAbogados.Api`)
  - Gateway Ocelot en `http://localhost:5000` (`dotnet run` desde `backend/src/ECAbogados.Gateway`)
  - Frontend en `http://localhost:3000` (`npm run dev` desde `frontend/web`, `node_modules` ya instalado)
- Estos procesos corrieron en segundo plano dentro de la sesión de Claude Code que hizo las pruebas; **no quedan garantizados como corriendo** en una sesión nueva — hay que volver a levantarlos siguiendo `README.md`.

## Estado de git / GitHub

- El proyecto **no tenía repositorio git** al iniciar este trabajo (`git init` se ejecutó desde cero).
- Remoto configurado: `origin` → `https://github.com/jfrodriguezva/Lawyer.git` (repo existía vacío en GitHub, sin commits previos, así que no hubo conflicto).
- `.gitignore` creado para excluir: `bin/`, `obj/`, `node_modules/`, `.next/`, `App_Data/` (documentos subidos), `.env.local`, archivos de IDE/OS.
- **Nota de identidad de commit:** la configuración global de git en esta máquina usa `jfrodriguezv@truper.com` como autor (config previa del usuario, no se modificó). Si el remoto de GitHub requiere que el autor coincida con la cuenta `jfrodriguezva`, puede ser necesario ajustar `user.email` local en este repo.
- Si se retoma el trabajo y `git remote -v` no muestra `origin`, o `git log` está vacío, significa que el push no llegó a completarse (posible bloqueo de autenticación interactiva del Git Credential Manager) — revisar y reintentar `git push -u origin main`.

## Decisiones y hallazgos importantes (para no repetir la investigación)

- El secreto JWT **ya no está en el repo** (ver sección de hardening abajo) — se configura vía `dotnet user-secrets` en desarrollo o `Jwt__Secret` como variable de entorno en cualquier otro ambiente.
- Los documentos subidos por el panel se guardan en disco local (`App_Data/documentos/`), no en base de datos ni en blob storage — está excluido del repo vía `.gitignore`. Sigue siendo un punto a resolver (Azure Blob Storage) **cuando se aborde el despliegue a Azure**, explícitamente pospuesto por el usuario.
- Gestión de personal vía API: alta (`POST /usuarios`), listado (`GET /usuarios`) y activar/desactivar (`PATCH /usuarios/{id}/estatus`) ya existen. Editar nombre/rol/contraseña de un usuario existente sigue requiriendo SQL directo.
- Evaluación de madurez ya hecha (ver `docs/EVALUACION_FUNCIONAL.md`): es una herramienta interna válida para este despacho, **no** un producto de mercado (SaaS) listo para vender a otros despachos sin inversión adicional considerable (multi-tenancy, facturación completa, etc. — nótese que desde entonces sí se agregaron roles reales, tests y CI/CD, ver abajo).

## Mejoras de negocio implementadas (2026-09-07, plan "prancy-inventing-pinwheel")

El usuario pidió implementar las 11 mejoras de la evaluación funcional, con la restricción explícita de que todo fuera **gratis** (sin servicios de pago) antes de publicar a Azure. Se implementó todo el batch en una sola sesión, verificado con build limpio de backend y frontend, y smoke tests reales vía curl (login, crear caso con checklist auto-generado, portal por token, restricciones de rol 403/204, etc.). Detalle técnico completo en `docs/MANUAL_TECNICO.md` (secciones 4.1 a 4.5) y funcional en `docs/MANUAL_USUARIO.md`.

Resumen de lo agregado:
- **Notificaciones por correo** (SMTP nativo .NET, gratis) al staff: mensaje nuevo, cita nueva, recordatorio 24h antes de cita confirmada, alerta 3 días antes de un plazo. Requiere que el usuario configure `Smtp:*` y `Notificaciones:StaffEmail` en `appsettings.json` con una cuenta gratuita (Gmail app password o Brevo free tier) — sin configurar, solo se loguea en consola.
- **Analítica gratuita** (GA4 + Meta Pixel) vía `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_META_PIXEL_ID`, opt-in.
- **SEO básico**: `sitemap.ts`, `robots.ts`, metadata OpenGraph, JSON-LD `Attorney` en la landing.
- **Calendario visual** en `/agenda` con `react-big-calendar` + `date-fns` (MIT).
- **Roles reales** (Administrador/Asistente): cerrar un caso y gestionar Honorarios requiere Administrador (verificado con 403 real). Alta de personal vía `/usuarios` (antes solo por SQL).
- **Checklist de requisitos** por tipo de trámite, auto-generado al crear un caso.
- **Portal del cliente** por enlace mágico (`TokenAcceso` por caso, sin login) en `/portal/{token}`.
- **Plazos y audiencias** con alerta automática por correo.
- **Honorarios/pagos** por caso (solo Administrador).
- **KPIs de negocio** en el dashboard (tasa de confirmación de citas, % mensajes atendidos, casos cerrados) — calculados en cliente, sin backend nuevo.
- **Nuevas landings de servicio** (`/servicios/[slug]`: pensión alimenticia, custodia, régimen de visitas, violencia familiar) con copy de marketing borrador que la abogada debe revisar antes de publicar.

**Hallazgo y resolución de MediatR:** el log de la API reveló que **MediatR 14.2.0** (dependencia preexistente, no agregada en este batch) requiere licencia de pago (Lucky Penny Software) para uso en producción. Esto entraba en conflicto directo con el requisito de "gratis" del usuario, quien pidió reemplazarlo por una solución manual. **Se resolvió**: se construyó un mediador propio en `backend/src/ECAbogados.Application/Mediation/` (`IRequest`, `IRequestHandler`, `ISender`/`Sender` resuelto vía DI + reflexión, registro manual por escaneo del propio ensamblado en `DependencyInjection.cs`). Se reemplazó `using MediatR;` por `using ECAbogados.Application.Mediation;` en 57 archivos (cambio mecánico, misma forma de tipos). Verificado con build limpio (0 errores) y smoke test completo de todos los endpoints (paridad funcional confirmada). El paquete MediatR ya no está referenciado en ningún `.csproj`. Detalle técnico en `docs/MANUAL_TECNICO.md` sección 4.5.

Este batch quedó comiteado y pusheado a `main` (commit `3230674`) tras verificación completa (builds limpios + smoke test end-to-end de cada endpoint nuevo).

## Hardening de seguridad, tests, CI y portal (2026-09-08, mismo plan file reutilizado)

Tras el batch anterior, el usuario pidió el resto de los pendientes (excepto todo lo específico de Azure, explícitamente pospuesto). Se aplicó:

- **Secreto JWT fuera del repo**: `appsettings.json` ahora tiene `Jwt:Secret` vacío; `Program.cs` valida con `string.IsNullOrWhiteSpace` y falla con mensaje explícito si falta. En esta máquina se corrió `dotnet user-secrets init` + `set` con un valor aleatorio (no está en el repo, vive en el perfil de este usuario de Windows). Documentado en `docs/MANUAL_TECNICO.md` §4.
- **Activar/desactivar personal**: columna `Usuarios.Activo` (default 1), login rechaza usuarios inactivos (mismo mensaje que credenciales inválidas), `PATCH /usuarios/{id}/estatus` (Administrador), bloqueo de auto-desactivación verificado con curl (400). UI en `/usuarios` con botón activar/desactivar.
- **Portal: expiración y regeneración**: enlace válido 180 días (`ObtenerCasoPorTokenQueryHandler`); `POST /casos/{id}/regenerar-token` (Administrador) invalida el anterior al instante — verificado con curl (200 → 404 con el token viejo → 200 con el nuevo). Botón "Regenerar enlace" en `/casos/{id}`.
- **Pruebas automatizadas**: `backend/tests/ECAbogados.Application.Tests` (xUnit, 12 tests, fakes escritos a mano sin Moq/NSubstitute) — pasan en verde (`dotnet test backend/ECAbogados.sln`).
- **CI**: `.github/workflows/ci.yml` (GitHub Actions, gratis) — build+test backend y lint+build frontend en cada push/PR a `main`. No se ha visto correr en GitHub todavía (no se puede probar localmente); revisar la pestaña Actions del repo tras el próximo push.
- **Copy de marketing**: pasada de pulido ligera en `lib/servicios.ts` (varió un par de frases repetidas entre servicios). **Sigue pendiente la revisión real de la abogada** antes de publicar — eso no se puede completar sin ella.
- Confirmado por el usuario: los 2 tokens de GitHub expuestos en el chat en la sesión anterior ya fueron revocados.

**Nota operativa:** durante esta sesión el sistema se quedó sin memoria y mató los 3 servicios en segundo plano (API/Gateway/frontend) más de una vez — quedaron varios procesos `node.exe`/`dotnet.exe` huérfanos de reinicios previos que había que limpiar manualmente. Si se retoma el trabajo y algo no responde en los puertos 3000/5000/5080, revisar procesos huérfanos (`tasklist`/`netstat -ano`) antes de asumir que el código está roto.

Este batch quedó comiteado y pusheado a `main` (commit `ffc6f00`); CI confirmado en verde en GitHub Actions.

## Edición de usuarios + auditoría (2026-09-08, mismo día, batch siguiente)

El usuario pidió avanzar los pendientes 2, 3, 4, 5 y 7 de la lista anterior:
- **Punto 4** (CI): confirmado en verde vía API de GitHub (`conclusion: success`) — no requirió código.
- **Puntos 2 y 3** (credenciales SMTP/GA/Pixel, revisión de copy): resueltos fuera de código — instrucciones para que el usuario configure sus propias credenciales vía `dotnet user-secrets`/`.env.local`, y un Artifact con el copy de las 4 landings para que la abogada lo revise cómodamente.
- **Punto 5 — Editar usuario existente**: `PUT /api/usuarios/{id}` (nombre, rol, contraseña opcional). Igual que con desactivación, un usuario **no puede cambiar su propio rol** (sí su nombre/contraseña) — verificado con curl (400 al intentar cambiar su propio rol, 204 en los demás casos). UI: botón "Editar" en `/usuarios` con formulario inline.
- **Punto 7 — Historial de cambios (auditoría)**: nueva tabla `Auditoria` (insert-only) + `ICurrentUserAccessor`/`CurrentUserAccessor` (Infrastructure, vía `IHttpContextAccessor`, requirió agregar `FrameworkReference` a `Microsoft.AspNetCore.App` en `ECAbogados.Infrastructure.csproj` — gratis, parte del runtime). Se audita: crear/actualizar caso, cambiar estatus, checklist, regenerar token, cita ligada a un caso (creación/estatus), subir documento, registrar pago. Acciones sin sesión (formulario público, portal) se registran como `"Público (sin sesión)"` — **verificado end-to-end con curl**: crear caso + cambiar estatus (autenticado) + agendar cita sin token (anónimo) ligada al mismo caso → el historial mostró las 3 entradas con el usuario correcto en cada una. `GET /api/auditoria/caso/{casoId}` (solo Administrador) alimenta la sección "Historial" en `/casos/{id}`.
- 12/12 tests siguen en verde (se actualizaron 2 tests existentes cuyos handlers cambiaron de firma, y se agregaron fakes `FakeAuditoriaRepository`/`FakeCurrentUserAccessor`).

**Nota de una falsa alarma durante las pruebas:** un curl con el nombre "García" (acento) dio 400 por un problema de codificación de la propia terminal bash de Windows al pasar `-d`, no un bug real — se confirmó reintentando con `--data-binary @archivo.json` en UTF-8. Si algo similar vuelve a pasar con acentos/ñ en pruebas manuales, sospechar primero de la codificación de la shell antes que del código.

## Seguridad, escalabilidad, UX y tests (2026-09-10, plan "prancy-inventing-pinwheel" reutilizado de nuevo)

El usuario pidió "mejora todo, menos el de azure, el de smtp" sobre una lista de pendientes que incluía: bloqueo de login, rate limiting, validación de archivos, "olvidé mi contraseña", CORS configurable, paginación/búsqueda, respaldos, accesibilidad/responsive y más cobertura de tests. Se implementó todo el batch (9 puntos), verificado con build + 27/27 tests en verde + smoke tests reales vía curl/PowerShell. Detalle técnico completo en `docs/MANUAL_TECNICO.md` (secciones 4.9 a 4.15) y funcional en `docs/MANUAL_USUARIO.md`.

Resumen de lo agregado:
- **Bloqueo de cuenta**: 5 intentos fallidos → 15 min de bloqueo (`Usuarios.IntentosFallidos`/`BloqueadoHasta`). Verificado en vivo: 5 logins fallidos + un 6º intento con la contraseña correcta → sigue rechazado.
- **Rate limiting** (`Microsoft.AspNetCore.RateLimiting`, built-in del SDK, sin paquetes): 5/min en `/auth/login`, 20/min en endpoints públicos (citas, contacto, portal). Verificado en vivo: la propia prueba de bloqueo disparó el 429 de la política `auth` antes que el bloqueo de cuenta, y 25 `POST /citas` seguidos dispararon 429 a partir del request 21.
- **Validación de archivos**: whitelist de extensiones + 50 MB máximo, verificada tanto en el validador (FluentValidation, corre vía el `Sender`) como en los controllers **antes** de escribir a disco (evita que un archivo inválido quede guardado). Verificado en vivo: subir un `.exe` → 400, sin crear el archivo.
- **"Olvidé mi contraseña"** self-service, reutilizando el `IEmailSender` ya existente (sin tocar configuración de SMTP real): `POST /auth/olvide-password` + `POST /auth/restablecer-password`, página pública nueva `/restablecer-password/[token]`. Verificado en vivo end-to-end: se generó el enlace (visible en el log de la API porque no hay SMTP configurado), se restableció la contraseña con el token y se volvió a iniciar sesión con la nueva.
- **CORS configurable** vía `Cors:AllowedOrigins` en `appsettings.json` (API y Gateway) en vez de hardcodeado.
- **Paginación y búsqueda**: `GET /casos/pagina` y `GET /contacto/pagina` (nuevos, con `OFFSET/FETCH`); los endpoints sin paginar se conservaron intactos porque el Dashboard depende de ellos para las KPIs totales. Búsqueda client-side en Agenda (calendario, no se pagina). Verificado en vivo con curl.
- **Respaldos gratis**: `backend/scripts/backup.ps1` (respalda la BD + comprime `App_Data/documentos`, con limpieza de respaldos >30 días), pensado para el Programador de tareas de Windows. **Hallazgo:** el `sqlcmd` clásico de Windows (Client SDK ODBC 17) tiene un bug real donde `-v Variable="C:\ruta"` se come la letra de unidad; se resolvió generando el `BACKUP DATABASE` como `-Q` directo en vez de usar sustitución de variables. Verificado ejecutando el script real: generó un `.bak` de ~5.8 MB sin error.
- **Accesibilidad/responsive**: `:focus-visible` dorado global (antes dependía del outline default del navegador, poco visible en el tema oscuro), checklist del caso con `<label>` envolvente (clic en el texto también marca el checkbox), tabla de usuarios con `overflow-x-auto` para no romper en móvil.
- **Cobertura de tests ampliada**: de 13 a 27 pruebas (bloqueo de login, validador de documentos, token de portal expirado, ambos handlers de reset de contraseña).

Este batch aún no se ha comiteado/pusheado — pendiente al momento de escribir esta nota (ver `git status` para confirmar el estado real antes de asumir que ya se subió).

## Rebrand ECG Abogados + 3 perfiles + 11 servicios (2026-09-11, plan "prancy-inventing-pinwheel" reutilizado)

El usuario pidió rebrandear "EC Abogados" → "ECG Abogados" (nuevo logo circular oro/negro con balanza de la justicia, tagline "Tu causa, nuestra prioridad") y expandir el negocio con una separación real de tres perfiles: **invitado** (marketing), **cliente** (login propio, ve su expediente) y **administrador/abogada** (gestiona leads, casos, cuentas de cliente). Al inicio dijo que ya había una carpeta nueva para esto, pero después aclaró que no existe tal carpeta y que los cambios van **en este mismo repo** — se descartó la idea de un proyecto separado.

Antes de programar, se presentó una propuesta completa y se usó `AskUserQuestion` para resolver 4 decisiones de producto (todas con la opción recomendada elegida): aviso de lead nuevo por correo + botón "Abrir WhatsApp" (sin API de pago), cuentas de Cliente creadas manualmente por la abogada, SAT con mini-landing propia, y ruta exacta a usar (la actual). Se exploró el código con 3 agentes en paralelo (branding/marketing frontend, auth/leads backend, UI del panel admin) y se armó un plan de 6 fases (A–F) con un Plan agent, revisado y corregido a mano antes de aprobarlo — el hallazgo más importante que el propio agente de planeación no cubrió del todo fue que `Caso.Tipo` está acoplado en tres lugares (`lib/servicios.ts`, `casos/page.tsx` TIPOS, `RequisitosPorTipo.cs`) que había que mantener sincronizados para que los servicios nuevos generaran checklist automático real, no solo copy de marketing.

Resumen de lo implementado (fases A–F completas):
- **Rebrand** (Fase A): `Monogram.tsx` rediseñado (mismo SVG puro, gradiente dorado, ahora con balanza de la justicia + texto "ECG"), barrido completo de "EC Abogados"→"ECG Abogados" en frontend, backend (asunto de correo de reset, título de Swagger) y READMEs, tagline nueva "Tu causa, nuestra prioridad" (la vieja "Tu libertad también es un derecho" se conservó como frase específica de la página de divorcio incausado). De paso se corrigió el claim "Sin trámites complicados" del hero por pedido explícito del usuario del inicio de la sesión (un juicio sí puede complicarse) y se corrigió el copy del divorcio incausado para explicar correctamente que no se necesita el consentimiento de la otra parte.
- **11 servicios** (Fase B): `lib/servicios.ts` creció de 4 a 11 entradas (se agregaron divorcio incausado —antes solo vivía hardcodeado en la home—, divorcio por mutuo consentimiento, sucesiones y herencias, cobranza y pagarés, contratos, trámites SAT y asesoría para empresas; se mantuvo `violencia-familiar` aunque no estaba en la lista original del usuario). Nuevo índice `/servicios` agrupado en "Derecho familiar"/"Asesoría fiscal y empresarial", franja de navegación rápida (`QuickNav.tsx`) en la home, franja "Otros servicios" al final de cada landing.
- **Backend funcional para los nuevos trámites** (Fase C): `RequisitosPorTipo.cs` y el dropdown de `casos/page.tsx` ganaron entradas para los 7 tipos nuevos (checklist automático real, no solo cosmético) — marcado explícitamente para que la Lic. Erika revise que los documentos listados sean correctos, es contenido legal, no solo marketing.
- **Cliente (portal autenticado)** (Fase C): tabla `Clientes` nueva (mismas columnas de seguridad que `Usuarios`, sin `Rol`), `Caso.ClienteId` (FK nullable, aditivo — el portal anónimo por token sigue intacto), login/JWT propio con rol `"Cliente"` (`LoginClienteCommandHandler`, copia del flujo de bloqueo de `LoginCommandHandler`), `GET /cliente/mis-casos`. **Endurecimiento de seguridad crítico**: `CasosController`, `CitasController`, `DocumentosController`, `PlazosController` y `ContactoController` pasaron de `[Authorize]` (sin rol) a `[Authorize(Roles = "Administrador,Asistente")]` — sin este cambio, un JWT de Cliente habría podido llamar esos endpoints de staff. Verificado en vivo con curl: un Cliente de prueba vinculado a un caso vio solo ese caso en `mis-casos` y recibió `403` en los 6 endpoints de staff probados.
- **Panel de administrador** (Fase D): botón "Abrir WhatsApp" (enlace `wa.me`, gratis) en Agenda y Mensajes, filtro por servicio de interés en ambas, nueva sección `/clientes` (alta/activar/desactivar cuentas), tarjeta "Cuenta de cliente" en el detalle de caso para vincular.
- **Portal de Cliente frontend** (Fase E): `/cliente/login` y `/cliente/portal` (de solo lectura, reutiliza casi el mismo layout de tarjetas que el portal anónimo), cookies propias (`ecg_cliente_token`/`ecg_cliente_user`) distintas de las del staff para que ambas sesiones convivan en el mismo navegador.
- **Tests**: de 27 a 32 (4 de `LoginClienteCommandHandler` + 1 de `VincularClienteACasoCommandHandler`), todos en verde.

**Incidente durante las pruebas en vivo (resuelto, no es un bug de código):** al probar `/servicios/tramites-sat` en el navegador, el servidor de desarrollo del frontend (corriendo desde hacía muchas horas en esta sesión) devolvió un 500 con el error interno "Jest worker encountered 2 child process exceptions, exceeding retry limit" — es el mismo problema de RAM baja de la máquina ya documentado antes en este archivo, esta vez tumbando un worker de compilación de Next.js en vez de `dotnet run`/`npm run dev` completos. Se resolvió matando ese proceso puntual (PID identificado vía `netstat`) y levantando `npm run dev` de nuevo; todas las rutas nuevas respondieron 200 después. Si esto vuelve a pasar, no asumir que el código está roto — reiniciar el servidor de desarrollo primero.

Esta pasada aún **no se ha comiteado ni pusheado** — pendiente al momento de escribir esta nota.

## Próximos pasos sugeridos (pendientes, no iniciados)

Ninguno de estos ha sido solicitado explícitamente todavía:
- El propio despliegue a Azure (explícitamente pospuesto varias veces) — incluye decidir sobre Blob Storage para documentos.
- Configurar credenciales reales de SMTP/`Notificaciones:StaffEmail`/GA4/Meta Pixel (el usuario pidió dejarlas listas, no configurarlas ahora).
- Revisión final del copy de marketing por la Lic. Erika Cruz García (hay un Artifact preparado para facilitárselo de una sesión anterior — buscar con `action: list` si no se tiene la URL a la mano). Con el rebrand y los 11 servicios, esta revisión ahora es más grande: incluye también el copy nuevo de los 7 servicios agregados y, especialmente, los checklists de documentos legales de `RequisitosPorTipo.cs` (contenido legal, no solo marketing).
- La "comercializadora" que el usuario mencionó como posible negocio futuro — explícitamente fuera de alcance esta ronda, no se construyó nada (ni siquiera un placeholder en el nav).

## Cómo retomar el trabajo en un chat nuevo

1. Lee este archivo completo primero.
2. Si necesitas el estado exacto del código, no confíes en memoria — corre `git log --oneline -10` y `git status` para ver el estado real.
3. Si necesitas levantar el entorno, sigue `README.md` paso a paso (no asumas que los servidores de la sesión anterior siguen corriendo).
4. Si el usuario pide continuar con alguno de los "próximos pasos sugeridos", confírmalo con él antes de asumir alcance — esa lista es solo un registro de ideas mencionadas, no un backlog aprobado.
