# RECOVERY.md — Contexto de recuperación del proyecto

> Este archivo existe para que, si esta conversación se pierde o se retoma el trabajo en otro chat/sesión de Claude, se pueda reconstruir el contexto completo sin tener que re-explorar todo el repositorio desde cero. Léelo primero.

## ¿Qué es este proyecto?

**EC Abogados**: sistema de gestión para un despacho de abogados especializado en divorcio incausado (Lic. Erika Cruz García). Landing pública de captación + panel administrativo privado (casos, citas, documentos, mensajes de contacto).

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

## Próximos pasos sugeridos (pendientes, no iniciados)

Ninguno de estos ha sido solicitado explícitamente todavía:
- El propio despliegue a Azure (explícitamente pospuesto en las dos últimas sesiones) — incluye decidir sobre Blob Storage para documentos.
- Configurar credenciales reales de SMTP/`Notificaciones:StaffEmail`/GA4/Meta Pixel (el usuario pidió dejarlas listas, no configurarlas ahora).
- Revisión final del copy de marketing por la Lic. Erika Cruz García.
- Confirmar que el workflow de GitHub Actions corre correctamente una vez pusheado (no verificable localmente).
- Edición de datos de usuario existente (nombre/rol/password) vía API — hoy solo alta/listado/activar-desactivar.

## Cómo retomar el trabajo en un chat nuevo

1. Lee este archivo completo primero.
2. Si necesitas el estado exacto del código, no confíes en memoria — corre `git log --oneline -10` y `git status` para ver el estado real.
3. Si necesitas levantar el entorno, sigue `README.md` paso a paso (no asumas que los servidores de la sesión anterior siguen corriendo).
4. Si el usuario pide continuar con alguno de los "próximos pasos sugeridos", confírmalo con él antes de asumir alcance — esa lista es solo un registro de ideas mencionadas, no un backlog aprobado.
