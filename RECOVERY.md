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

- El secreto JWT (`Jwt:Secret` en `backend/src/ECAbogados.Api/appsettings.json`) está hardcodeado en texto plano — **conocido y documentado como pendiente de resolver antes de producción**, no es un descuido a "corregir" sin que el usuario lo pida explícitamente.
- Los documentos subidos por el panel se guardan en disco local (`App_Data/documentos/`), no en base de datos ni en blob storage — está excluido del repo vía `.gitignore`.
- No existe gestión de usuarios vía API; altas de personal se hacen directo por SQL contra `dbo.Usuarios`.
- Evaluación de madurez ya hecha (ver `docs/EVALUACION_FUNCIONAL.md`): es una herramienta interna válida para este despacho, **no** un producto de mercado (SaaS) listo para vender a otros despachos sin inversión adicional considerable (multi-tenancy, roles reales, facturación, integraciones de notificación, tests, CI/CD).

## Próximos pasos sugeridos (pendientes, no iniciados)

Ninguno de estos ha sido solicitado explícitamente todavía — están aquí solo como posibles continuaciones mencionadas en la conversación, no como plan aprobado:
- Mejorar la vista de Agenda a calendario visual en vez de tabla.
- Integrar notificaciones automáticas (WhatsApp/email) al confirmar citas o recibir mensajes.
- Agregar pruebas automatizadas y pipeline CI/CD.
- Mover secretos (JWT, connection string) a variables de entorno / secret manager.
- Definir roles y permisos reales más allá de "autenticado sí/no".

## Cómo retomar el trabajo en un chat nuevo

1. Lee este archivo completo primero.
2. Si necesitas el estado exacto del código, no confíes en memoria — corre `git log --oneline -10` y `git status` para ver el estado real.
3. Si necesitas levantar el entorno, sigue `README.md` paso a paso (no asumas que los servidores de la sesión anterior siguen corriendo).
4. Si el usuario pide continuar con alguno de los "próximos pasos sugeridos", confírmalo con él antes de asumir alcance — esa lista es solo un registro de ideas mencionadas, no un backlog aprobado.
