# Manual técnico — ECGAbogados

## 1. Arquitectura general

```
Navegador → Frontend Next.js (:3000) → API .NET (:5080) → SQL Server
```

El frontend (`lib/api.ts`) apunta por defecto a `http://localhost:5080` (o a `NEXT_PUBLIC_API_URL` si está definida), es decir, habla directo con la API. En producción, nginx expone un solo dominio y enruta `/api/*` hacia la API y todo lo demás hacia el frontend (ver `deploy/nginx.conf`); no hay Gateway intermedio (hubo uno basado en Ocelot que se retiró por no usarse en producción y no cubrir todos los endpoints).

## 2. Backend — `ECAbogados` (.NET 10, Clean Architecture)

4 proyectos en `backend/src/`:

| Proyecto | Responsabilidad |
|---|---|
| `ECAbogados.Domain` | Entidades puras: `Caso`, `Cita`, `Documento`, `Usuario`, `Cliente`, `MensajeContacto` + enums `EstatusCaso`, `EstatusCita`. Sin dependencias externas. |
| `ECAbogados.Application` | Lógica de negocio con CQRS vía un **mediador propio** (ver 4.5): Commands/Queries/Handlers/Validators organizados por feature (`Casos`, `Citas`, `Documentos`, `Auth`, `Contacto`, `Clientes`), DTOs e interfaces de repositorio. |
| `ECAbogados.Infrastructure` | Implementación de repositorios sobre SQL Server (`SqlConnectionFactory`, políticas de resiliencia con Polly), `BcryptPasswordHasher`, `JwtTokenGenerator`. |
| `ECAbogados.Api` | API REST (ASP.NET Core Web API): Controllers, JWT Bearer auth, Swagger, CORS. Escucha en `http://localhost:5080`. |

Patrón por feature dentro de `Application`, por ejemplo `Casos/Commands/CrearCaso/`: `CrearCasoCommand` + `CrearCasoCommandHandler` + `CrearCasoCommandValidator`.

## 3. Endpoints de la API

Base: `/api`

| Recurso | Método/Ruta | Auth | Descripción |
|---|---|---|---|
| Auth | `POST /auth/login` | Anónimo | Devuelve JWT + datos de usuario |
| | `POST /auth/olvide-password` | Anónimo | Solicita enlace de restablecimiento (siempre responde 200, no revela si el correo existe) |
| | `POST /auth/restablecer-password` | Anónimo | Establece nueva contraseña a partir del token del enlace |
| Casos | `GET /casos` | JWT | Listar (todos, usado por el Dashboard para KPIs) |
| | `GET /casos/pagina?page=&pageSize=&search=` | JWT | Listar paginado, con búsqueda opcional por cliente/tipo |
| | `GET /casos/{id}` | JWT | Detalle |
| | `POST /casos` | JWT | Crear |
| | `PUT /casos/{id}` | JWT | Actualizar cliente/tipo/notas |
| | `PATCH /casos/{id}/estatus` | JWT | Cambiar estatus |
| Citas | `GET /citas` | JWT | Listar |
| | `POST /citas` | Anónimo | Crear (usado por el sitio público) |
| | `PATCH /citas/{id}/estatus` | JWT | Confirmar/cancelar |
| Documentos | `GET /documentos/caso/{casoId}` | JWT | Listar por caso |
| | `POST /documentos` (multipart, máx. 50 MB) | JWT | Subir archivo (extensión y tamaño se validan antes de escribir a disco — ver 4.15) |
| Contacto | `POST /contacto` | Anónimo | Crear mensaje (formulario público) |
| | `GET /contacto` | JWT | Listar mensajes (todos) |
| | `GET /contacto/pagina?page=&pageSize=` | JWT | Listar paginado |
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
| | `PUT /usuarios/{id}` | JWT (**Administrador**) | Editar nombre/rol/contraseña (no puede cambiar su propio rol) |
| Auditoría | `GET /auditoria/caso/{casoId}` | JWT (**Administrador**) | Historial de cambios sobre el caso |
| Cliente (portal autenticado) | `POST /cliente/login` | Anónimo | Login del Cliente, devuelve JWT con rol `Cliente` (ver 4.16) |
| | `GET /cliente/mis-casos` | JWT (**Cliente**) | Lista los casos vinculados a la cuenta que inició sesión |
| Clientes (admin) | `GET /clientes` | JWT (**Administrador**) | Listar cuentas de cliente |
| | `POST /clientes` | JWT (**Administrador**) | Crear cuenta de cliente (nombre/correo/contraseña) |
| | `PATCH /clientes/{id}/estatus` | JWT (**Administrador**) | Activar/desactivar una cuenta de cliente |
| Casos | `POST /casos/{id}/vincular-cliente` | JWT (**Administrador**) | Vincula el expediente a una cuenta de Cliente existente |

| Módulos | `GET /modulos/activos` | Anónimo | Todos los módulos (activos e inactivos: el sitio público necesita conocer los inactivos para mostrarlos como "Próximamente") |
| | `GET /modulos` | JWT (**Administrador**) | Listar (idéntico al anterior, pensado para el panel) |
| | `POST /modulos` | JWT (**Administrador**) | Crear |
| | `PUT /modulos/{id}` | JWT (**Administrador**) | Actualizar |
| | `PATCH /modulos/{id}/activo` | JWT (**Administrador**) | Activar/desactivar |
| | `DELETE /modulos/{id}` | JWT (**Administrador**) | Eliminar (en cascada: borra sus Servicios y los vínculos de esos servicios en Promociones) |
| Servicios | `GET /servicios/activos` | Anónimo | Solo servicios activos de módulos activos (consumido por `/servicios`, `/servicios/[slug]`, el NavBar, el sitemap y los filtros de Agenda/Mensajes) |
| | `GET /servicios?moduloId=` | JWT (**Administrador**) | Listar, con filtro opcional por módulo |
| | `POST /servicios` | JWT (**Administrador**) | Crear |
| | `PUT /servicios/{id}` | JWT (**Administrador**) | Actualizar |
| | `PATCH /servicios/{id}/activo` | JWT (**Administrador**) | Mostrar/ocultar |
| | `DELETE /servicios/{id}` | JWT (**Administrador**) | Eliminar (limpia también sus vínculos en Promociones) |
| Promociones | `GET /promociones/activas` | Anónimo | Promociones activas (Id, Texto, ServicioIds — nunca expone la ruta del archivo) |
| | `GET /promociones/{id}/imagen` | Anónimo | Sirve la imagen (contenido de mercadeo, no un documento sensible) |
| | `GET /promociones` | JWT (**Administrador**) | Listar todas |
| | `POST /promociones` (multipart, máx. 5 MB) | JWT (**Administrador**) | Crear (imagen + texto + `Servicios[]`) |
| | `PUT /promociones/{id}` (multipart) | JWT (**Administrador**) | Actualizar (imagen opcional: si no se manda archivo nuevo, conserva el actual) |
| | `PATCH /promociones/{id}/activo` | JWT (**Administrador**) | Activar/desactivar |
| | `DELETE /promociones/{id}` | JWT (**Administrador**) | Eliminar (borra también el archivo físico) |

Swagger UI disponible en `http://localhost:5080/swagger`.

## 4.1 Roles y autorización

Tres roles posibles en el claim de rol del JWT: `Administrador`, `Asistente` (staff, emitidos por `/auth/login`) y `Cliente` (portal autenticado, emitido por `/cliente/login` — ver 4.16). Restricciones aplicadas a nivel de controller:
- `CasosController`, `CitasController`, `DocumentosController`, `PlazosController` y las acciones autenticadas de `ContactoController` requieren `[Authorize(Roles = "Administrador,Asistente")]` — **antes** de agregar el rol `Cliente` bastaba con `[Authorize]` sin restricción de rol, pero eso habría dejado pasar un JWT de Cliente a endpoints de staff (la validación de JWT por sí sola no filtra por rol). Este endurecimiento se hizo específicamente al introducir el portal de Cliente.
- Cerrar un expediente (`PATCH /casos/{id}/estatus` con `Cerrado`) requiere además rol `Administrador` (verificación inline en `CasosController`).
- Todo el controller de `Pagos`, `Usuarios`, `Clientes` y `Auditoria` requiere `[Authorize(Roles = "Administrador")]`.
- `GET /cliente/mis-casos` requiere `[Authorize(Roles = "Cliente")]` — un JWT de staff no puede llamarlo (le falta el rol) y viceversa.

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

## 4.6 Activar/desactivar y editar personal

`Usuarios.Activo` (BIT, default `1`). Un login con `Activo = 0` responde igual que credenciales inválidas (no revela que la cuenta existe). `PATCH /usuarios/{id}/estatus` (solo `Administrador`) activa o desactiva; el propio controller bloquea que un administrador se desactive a sí mismo (comparando el `id` contra el `ClaimTypes.NameIdentifier` del JWT).

`PUT /usuarios/{id}` edita nombre, rol y opcionalmente la contraseña (se re-hashea con `IPasswordHasher`). Mismo patrón de auto-bloqueo: un usuario puede editar su propio nombre/contraseña, pero no su propio `Rol` (evita quedarse sin administradores por accidente) — se compara `request.Rol` contra el claim `ClaimTypes.Role` del JWT actual.

## 4.9 Bloqueo de cuenta por intentos fallidos

`Usuarios.IntentosFallidos` / `BloqueadoHasta`. `LoginCommandHandler`: cada password incorrecto incrementa el contador; al llegar a 5 intentos, la cuenta queda bloqueada 15 minutos (`BloqueadoHasta = UtcNow + 15min`) y el contador se reinicia a 0. Mientras `BloqueadoHasta` sea futuro, el login se rechaza aunque la contraseña sea correcta, con un mensaje distinto ("cuenta bloqueada temporalmente") al de credenciales inválidas. Un login exitoso limpia ambos campos.

## 4.10 Rate limiting (built-in de .NET, sin paquetes)

`Microsoft.AspNetCore.RateLimiting` (incluido en el SDK, sin NuGet adicional). Dos políticas de ventana fija, particionadas por IP remota, configuradas en `Api/Program.cs`:

| Política | Límite | Aplicada a |
|---|---|---|
| `auth` | 5 solicitudes / minuto | `POST /auth/login` |
| `public` | 20 solicitudes / minuto | `POST /citas`, `POST /contacto`, endpoints de `PortalController` |

Al superar el límite, la API responde `429 Too Many Requests`. Verificado en vivo: 21 `POST /citas` seguidos en menos de un minuto — las primeras se procesan (o rechazan por validación normal) y a partir de la solicitud 21 la respuesta es 429.

## 4.11 Recuperar contraseña (self-service)

Reutiliza `IEmailSender`/`IPasswordResetNotifier` (mismo mecanismo "gratis" que las demás notificaciones — ver 4.2: sin `Smtp:Host` configurado, el enlace solo se registra en el log de la API).

Flujo:
1. `POST /auth/olvide-password { email }` → si el correo existe y está activo, genera `ResetToken` (GUID) con vigencia de 1 hora (`Usuarios.ResetTokenExpira`) y envía `{Sitio:BaseUrl}/restablecer-password/{token}`. Siempre responde 200 con el mismo mensaje, exista o no la cuenta (no filtra qué correos están registrados).
2. `POST /auth/restablecer-password { token, nuevaPassword }` → valida que el token exista y no haya expirado; si es válido, re-hashea la contraseña, limpia el token y resetea el bloqueo de login (4.9). Token inválido/expirado → 400.

`appsettings.json`: nueva sección `"Sitio": { "BaseUrl": "http://localhost:3000" }` (usada para construir el enlace). Frontend: `/login` tiene un enlace "¿Olvidaste tu contraseña?" que abre un formulario inline; `/restablecer-password/[token]` es una página pública nueva con el formulario de nueva contraseña.

## 4.12 CORS configurable

`Cors:AllowedOrigins` (array) en `appsettings.json` de la API, en vez de un origen hardcodeado — para producción basta con agregar el dominio real ahí, sin tocar código. Default: `["http://localhost:3000"]`.

## 4.13 Paginación y búsqueda

`Casos` y `MensajesContacto` exponen un endpoint paginado adicional (`GET /casos/pagina`, `GET /contacto/pagina`) que corre `OFFSET/FETCH` + `COUNT(*)` en SQL Server. Los endpoints originales sin paginar (`GET /casos`, `GET /contacto`) **se conservaron intactos** porque el Dashboard depende de ellos para calcular KPIs sobre el total de registros — paginar esa fuente habría corrompido esos conteos. En Casos, `search` filtra por `ClienteNombre`/`Tipo` (`LIKE`). El frontend (`casos/page.tsx`, `mensajes/page.tsx`) agrega controles "Anterior/Siguiente" y, en Casos, un input de búsqueda con debounce. La Agenda no se pagina (es un calendario, se navega por fecha); ahí `agenda/page.tsx` filtra client-side sobre los eventos ya cargados por nombre/teléfono.

## 4.14 Respaldos (gratis, sin servicios externos)

- `backend/database/backup.sql`: referencia del `BACKUP DATABASE` para ejecución manual (usa una variable `$(BackupPath)` de `sqlcmd -v`, pensada para sqlcmd fuera de Windows o versiones donde esa sintaxis funciona correctamente).
- `backend/scripts/backup.ps1`: script real usado para respaldar. Genera el `BACKUP DATABASE` como `-Q` directo (no `-v`) porque el sqlcmd clásico de Windows (Client SDK ODBC 17, el que trae `sqlcmd -?` → versión 16.0.1000.6) tiene un bug de parseo que se come la letra de unidad (`C:`) cuando el valor de una variable `-v` contiene `unidad:\ruta`. Comprime además `App_Data/documentos` a un `.zip` con el mismo timestamp, y borra respaldos con más de 30 días (parámetro `-DiasRetencion`). Todo se guarda en `backend/backups/` (excluida del repo por `.gitignore`).
- **Programarlo con el Programador de tareas de Windows** (gratis, sin Azure): `taskschd.msc` → Crear tarea básica → Desencadenador diario (p. ej. 2:00 a.m.) → Acción "Iniciar un programa": programa `powershell.exe`, argumentos `-ExecutionPolicy Bypass -File "C:\ruta\al\repo\backend\scripts\backup.ps1"`. Verificado ejecutándolo manualmente: genera `ECAbogados_<timestamp>.bak` (~5.8 MB con los datos semilla) y limpia respaldos antiguos sin error.

## 4.15 Validación de tipo y tamaño de documentos

`Application/Documentos/TiposPermitidos.cs`: whitelist de extensiones (`.pdf .doc .docx .xls .xlsx .jpg .jpeg .png`) y tamaño máximo de 50 MB, usada tanto en `SubirDocumentoCommandValidator` (defensa a nivel de dominio, corre automáticamente vía el `Sender` — ver 4.5) como directamente en `DocumentosController`/`PortalController` **antes** de escribir el archivo a disco: si solo se validara en el comando, un archivo inválido ya habría quedado guardado en `App_Data/documentos` para cuando el `Sender` lo rechazara. Verificado en vivo: subir un `.exe` responde `400` sin crear el archivo.

## 4.16 Portal de Cliente autenticado (cuentas reales)

Distinto del portal anónimo por enlace mágico (4.4), que **sigue existiendo sin cambios**. Un `Cliente` es una cuenta real (correo/contraseña) que la abogada crea manualmente desde `/clientes` (solo Administrador) y vincula a uno o más `Caso` mediante `Caso.ClienteId` (columna nullable, aditiva — un caso sin cliente vinculado sigue funcionando exactamente igual que antes).

- Tabla `Clientes`: mismas columnas de seguridad que `Usuarios` (`IntentosFallidos`, `BloqueadoHasta`, `ResetToken`/`Expira`) pero sin `Rol` — el rol `"Cliente"` se fija al emitir el JWT, no se guarda por fila.
- `LoginClienteCommandHandler` es una copia casi textual de `LoginCommandHandler` (mismo bloqueo a 5 intentos/15 min) contra `IClienteRepository` en vez de `IUsuarioRepository`.
- `IJwtTokenGenerator.GenerateTokenParaCliente(Cliente)` reusa el mismo método privado de construcción de claims que `GenerateToken(Usuario)` (mismo secreto/issuer/audience), solo cambia el claim de rol a `"Cliente"`.
- `GET /cliente/mis-casos` reutiliza el mismo DTO (`PortalCasoDto`) que ya usaba el portal anónimo — la única diferencia es que junta **todos** los casos de `Caso.ClienteId = <id del JWT>` en vez de resolver uno solo por token.
- El portal autenticado (`frontend/web/app/cliente/portal/page.tsx`) es de **solo lectura** (ve estatus, checklist y documentos que la abogada carga) — a diferencia del portal anónimo, no permite subir documentos; así se acotó el alcance a lo pedido ("el cliente visualiza, el abogado carga la información").
- Cookies del portal de Cliente (`ecg_cliente_token`/`ecg_cliente_user`) son **distintas** de las del staff (`ec_token`/`ec_user`) para que ambas sesiones puedan coexistir sin pisarse en el mismo navegador; `lib/api.ts` tiene un wrapper de request independiente (`requestCliente`) para no mezclar la lógica.
- Verificado en vivo: se creó un cliente, se vinculó a un caso, se inició sesión como ese cliente, `mis-casos` devolvió solo ese caso, y el mismo JWT recibió `403` en `/api/casos`, `/api/citas`, `/api/documentos/...`, `/api/plazos/...`, `/api/contacto` y `/api/usuarios`. El portal anónimo por token se probó sin cambios de comportamiento.

## 4.17 Servicio de interés en leads + botón de WhatsApp

`Cita.ServicioInteres`/`MensajeContacto.ServicioInteres` (columnas nullables) etiquetan un lead con el servicio del que vino (ej. "Trámites SAT"), enviado por el frontend cuando el formulario se llena desde una página de servicio específica (`GuestPanel` recibe un prop opcional `servicioInteres`, pasado por `app/servicios/[slug]/page.tsx` con `servicio.tipo`; el formulario genérico de la home no lo manda). El panel de administrador (`agenda/page.tsx`, `mensajes/page.tsx`) permite filtrar por este campo (client-side sobre la página ya cargada, sin endpoint nuevo).

El aviso de un lead nuevo sigue siendo 100% gratuito: el correo inmediato a `IStaffNotifier` ya existía (ver 4.2), y se sumó un botón "Abrir WhatsApp" en cada cita/mensaje del panel que arma un enlace `wa.me` (`lib/whatsapp.ts`, código de país `52` + 10 dígitos) con texto prellenado — abre una conversación de WhatsApp normal que la abogada contesta desde su propio teléfono, sin ninguna API de pago de WhatsApp Business.

## 4.18 Rebrand y expansión de servicios (ECGAbogados) — catálogo original, ver 4.19

El despacho pasó de "EC Abogados" a **ECGAbogados** (rebrand de texto/marca visible únicamente — namespaces `.NET`, nombre de la base de datos, `Jwt:Issuer`/`Audience` y el repo se mantuvieron igual a propósito, es un cambio cosmético/de marketing, no técnico). El logo es un SVG dibujado a mano en `components/Monogram.tsx` (igual que antes, sin assets rasterizados) con un motivo de balanza de la justicia agregado.

> **Nota:** lo descrito a continuación sobre `lib/servicios.ts` como arreglo hardcodeado con 11 entradas estáticas **ya no aplica** — el catálogo se migró a BD (ver 4.19). Se deja este párrafo por su valor histórico (por qué el campo `tipo` importa) y porque el criterio de sincronización con `RequisitosPorTipo.cs` sigue vigente, solo que ahora se captura desde el panel en vez de en código.

El campo `tipo` de cada servicio debe coincidir exactamente con: (a) el arreglo `TIPOS` en `app/(app)/casos/page.tsx` (dropdown al crear un expediente) y (b) las llaves del catálogo `RequisitosPorTipo.cs` (checklist automático) — no hay integridad referencial que lo obligue, así que si no coinciden, simplemente no se dispara el checklist automático al abrir un caso de ese tipo (no rompe nada, solo no genera la lista de requisitos).

## 4.19 Catálogo de Módulos, Servicios y Promociones (administrable desde el panel)

Reemplaza el arreglo hardcodeado de 4.18: el catálogo del sitio público vive en BD y es 100% editable por el rol **Administrador** desde `/catalogo-servicios` (Módulos y Servicios, una sola vista) y `/promociones`.

**Jerarquía (dos niveles):**
- **Módulo** (`dbo.Modulos`) = "categoría padre" del sitio (Abogado, SAT, Comercializadora, y las que se agreguen). Campos: `Nombre`, `Slug`, `RolResponsable` (`Abogado`/`Consultor`/`Agente`), `Activo`, `Orden`.
- **Servicio** (`dbo.Servicios`) = la ficha publicada en `/servicios/{slug}` (antes una entrada de `servicios.ts`). Pertenece a un Módulo. `Beneficios` y `Proceso` se guardan como **JSON** (`NVARCHAR(MAX)`, claves camelCase) en vez de tablas hijas — el repositorio (`ServicioRepository.cs`) serializa/deserializa con `JsonSerializerOptions(JsonSerializerDefaults.Web)` (case-insensitive; sin esta opción el JSON camelCase no calza con los records PascalCase y todo deserializa en `null` — bug real que se dio y se corrigió). `Tipo` es el mismo campo de 4.18 (debe coincidir a mano con `RequisitosPorTipo.cs`, sin FK).

**No se tocó el motor de citas.** `dbo.SolicitudesCita.Modulo` sigue siendo el `CHECK IN ('Abogado','SAT')`/enum `ModuloSolicitud` de siempre. `RolResponsable` del Módulo decide qué le ofrece el sitio al visitante:
- `Abogado`/`Consultor` → el servicio usa el flujo de citas de siempre (`GuestPanel` con pestañas "Agendar cita"/"Enviar mensaje").
- `Agente` (Comercializadora, o cualquier módulo nuevo asignado a ese rol) → **no hay agenda todavía**: `GuestPanel` recibe un prop `aceptaCitas={false}` (calculado en `app/servicios/[slug]/page.tsx` y `LandingExperience.tsx` comparando `RolResponsable` del módulo del servicio) y solo muestra el formulario de contacto simple (`MensajesContacto`).

**Promociones** (`dbo.Promociones` + `dbo.PromocionServicios`, N:M): imagen + texto + `Activo`, asignable a uno o varios Servicios (FK real a `dbo.Servicios`, a diferencia de Módulos/Servicios que no tienen FK hacia el tipo de expediente). La imagen se guarda en disco bajo `App_Data/promociones/{guid}_{nombre}` (mismo patrón que Documentos — ver 4.15) y se sirve **siempre** vía `GET /api/promociones/{id}/imagen` (público, sin auth: es contenido de mercadeo, no un documento sensible), nunca como archivo estático — el frontend consume esa imagen con un `<img>` normal, **no** `next/image`: usar `next/image` contra un host `localhost` dispara la protección SSRF de Next.js 16 contra IPs privadas y la imagen no carga en desarrollo (bug real encontrado y corregido; en producción tampoco habría hecho falta configurar `remotePatterns`).

**Frontend:** `lib/servicios.ts` dejó de tener el arreglo `SERVICIOS` y ahora son solo dos helpers puros (`getServicioPorSlug`, `agruparPorModulo`) que operan sobre datos ya obtenidos con `getModulosPublicos()`/`getServiciosActivos()`/`getPromocionesActivasPublic()` (`lib/api.ts`) — estas tres son las únicas funciones que **no** pasan por el wrapper `request()` (que depende de `getCookie`/`document.cookie`, inválido en Server Components); hacen `fetch` directo para poder llamarse tanto desde componentes de servidor (`/servicios`, `/servicios/[slug]`) como de cliente (`GuestHeader`, `LandingExperience`). `/servicios` y `/servicios/[slug]` dejaron de ser estáticos (`generateStaticParams`) y ahora son `export const dynamic = "force-dynamic"`: sin esto, `next build` intenta prerenderizarlos contra la API en build time y falla si la API no está corriendo en ese momento (por ejemplo, al construir la imagen Docker del frontend antes de levantar el backend).

**NavBar:** el desplegable "Servicios" (`GuestHeader.tsx`) agrupa dinámicamente por Módulo (ya no por las "áreas" fijas Derecho familiar/Fiscal y empresarial/SAT de 4.18); un módulo inactivo, o activo pero sin servicios todavía, se muestra atenuado como "Próximamente". Si hay alguna promoción activa, aparece un punto rojo pulsante sobre "Servicios" con un tooltip al pasar el mouse listando los servicios en promoción.

**Verificado en vivo:** creación de un Módulo nuevo, un Servicio con beneficios/proceso, una Promoción con imagen real asignada a un servicio (banner visible en `/servicios/{slug}` y punto rojo + tooltip en el NavBar), y borrado en cascada de un Módulo con servicios (limpia también sus vínculos en `PromocionServicios`).

## 4.8 Historial de cambios (auditoría)

Tabla `Auditoria` (Entidad, EntidadId, Accion, Detalle, UsuarioId, UsuarioNombre, Fecha) — insert-only. `ICurrentUserAccessor` (Application) / `CurrentUserAccessor` (Infrastructure, vía `IHttpContextAccessor` — se agregó `FrameworkReference` a `Microsoft.AspNetCore.App` en `ECAbogados.Infrastructure.csproj`, sin costo, es parte del runtime) expone quién hace la solicitud actual leyendo los mismos claims del JWT; si no hay sesión (rutas anónimas: cita pública, subida vía portal), se registra como `"Público (sin sesión)"`.

Handlers que registran auditoría sobre el caso: crear/actualizar caso, cambiar estatus, marcar checklist, regenerar token del portal, agendar/cambiar estatus de una cita ligada al caso, subir documento, registrar pago. `GET /api/auditoria/caso/{casoId}` (solo `Administrador`, es información sensible del staff) alimenta la sección "Historial" en `casos/[id]/page.tsx`.

## 4.7 Pruebas automatizadas y CI

- `backend/tests/ECAbogados.Application.Tests`: proyecto xUnit con **fakes escritos a mano** (sin Moq/NSubstitute) para los repositorios — mismo espíritu "manual" que el mediador propio. Cubre `LoginCommandHandler`/`LoginClienteCommandHandler` (éxito, password incorrecto, cuenta inactiva, bloqueo al 5º intento fallido, reseteo del contador en login exitoso), `CrearCasoCommandHandler` (checklist auto-generado), `CambiarEstatusCasoCommandHandler`, `CrearUsuarioCommandHandler` (email duplicado), `VincularClienteACasoCommandHandler` (vincula y registra auditoría), `SubirDocumentoCommandValidator` (extensión no permitida, tamaño máximo), `ObtenerCasoPorTokenQueryHandler` (token expirado/inexistente/vigente), `SolicitarResetPasswordCommandHandler`/`RestablecerPasswordCommandHandler` (no revela si el correo existe, token expirado/inválido) y el propio `Sender`/registro de `AddApplication()`. 32 pruebas en total. Correr con `dotnet test backend/ECAbogados.sln`.
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

**Tablas (no exhaustivo, ver `schema.sql` para el listado completo):** `Usuarios`, `Clientes`, `Casos`, `Citas`, `Documentos`, `MensajesContacto`, `ChecklistItems`, `Plazos`, `Pagos`, `Prospectos`, `SolicitudesCita`, `Configuracion`, `CatalogoTramitesSAT`, `TramitesSAT`, y el catálogo administrable (ver 4.19): `Modulos`, `Servicios`, `Promociones`, `PromocionServicios`.

El script es idempotente (usa `IF NOT EXISTS`/`IF OBJECT_ID ... IS NULL`, seguro de volver a correr sobre una BD que ya tiene datos) e incluye datos semilla:
- Usuario administrador: `erika@ecgabogados.com` / contraseña `Cambiar123!` (hash bcrypt ya incluido).
- 2 casos y 2 citas de ejemplo para poblar el dashboard.
- 3 Módulos (Abogado, SAT, Comercializadora) y 11 Servicios, migrados desde lo que antes era el arreglo estático `servicios.ts` (ver 4.19), para que el sitio no pierda contenido al pasar a ser administrable.

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
├── page.tsx                → landing pública (home)
├── login/page.tsx          → login del staff
├── portal/[token]/page.tsx → portal del cliente por enlace mágico (sin login)
├── cliente/login/page.tsx  → login del Cliente (cuenta real, portal autenticado)
├── cliente/portal/         → layout.tsx (guard) + page.tsx (solo lectura de "mis casos")
├── servicios/page.tsx      → índice de servicios activos, agrupados por Módulo (dinámico, ver 4.19)
├── servicios/[slug]/page.tsx → landing de cada servicio + banner de promoción si aplica (dinámico)
├── sitemap.ts / robots.ts  → SEO nativo de Next.js (sitemap ahora dinámico, itera servicios de la API)
└── (app)/                  → grupo de rutas protegidas (staff)
    ├── layout.tsx           → guard: redirige a /login si no hay cookie ec_token
    ├── dashboard/page.tsx
    ├── casos/page.tsx
    ├── casos/[id]/page.tsx
    ├── agenda/page.tsx
    ├── mensajes/page.tsx
    ├── clientes/page.tsx    → solo Administrador (alta de cuentas de Cliente)
    ├── catalogo-servicios/page.tsx → solo Administrador (CRUD de Módulos y Servicios, ver 4.19)
    ├── promociones/page.tsx → solo Administrador (CRUD de Promociones, ver 4.19)
    └── usuarios/page.tsx    → solo Administrador
```

- `lib/api.ts`: cliente HTTP centralizado (fetch wrapper), define los tipos TS (`Caso`, `Cita`, `Documento`, `MensajeContacto`, `Cliente`), inyecta el JWT y maneja errores (`ApiError`); incluye un segundo wrapper (`requestCliente`) para las llamadas del portal de Cliente, que firma con una cookie distinta (ver 4.16).
- `lib/cookies.ts`: helpers `getCookie`/`setCookie` para persistir `ec_token`/`ec_user` (staff) y `ecg_cliente_token`/`ecg_cliente_user` (Cliente).
- `lib/whatsapp.ts`: helper `buildWhatsAppLink` para los botones "Abrir WhatsApp" del panel (ver 4.17).
- Sin gestor de estado global ni librería de fetching (no Redux/React Query): cada página usa `useState`/`useEffect` + llamadas directas a `lib/api.ts`.
- Estilo: Tailwind CSS 4 con paleta de marca personalizada (`brand-ink`, `brand-gold`, etc.).

## 7. Cómo levantar el proyecto localmente

**Requisitos:** .NET 10 SDK, Node.js 20+, SQL Server accesible (local o remoto) con autenticación de Windows o cadena de conexión ajustada.

```bash
# 1. Crear la base de datos y datos semilla
# -f 65001 es obligatorio: schema.sql está en UTF-8 y sin ese flag sqlcmd
# lee el archivo con el codepage por defecto y corrompe acentos/ñ al insertar
# (visible como "MarÃ­a" en vez de "María" en los datos semilla).
sqlcmd -S localhost -i backend/database/schema.sql -f 65001

# 2. Configurar el secreto JWT (una sola vez por máquina de desarrollo)
cd backend/src/ECAbogados.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Secret" "<genera-un-valor-aleatorio-largo>"

# 3. Levantar la API
dotnet run                       # http://localhost:5080

# 4. Levantar el frontend
cd frontend/web
npm install
npm run dev                      # http://localhost:3000
```

CORS está configurado vía `Cors:AllowedOrigins` en `appsettings.json` de la API (default `http://localhost:3000` — ver 4.12).

**`npm run dev` usa `next dev --webpack`, no Turbopack.** Next.js 16 por defecto arranca `next dev` con Turbopack, pero en este proyecto eso rompe la carga de las fuentes de Google (`next/font/google` en `app/layout.tsx`): cualquier página responde 500 con `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`, siempre, no solo en páginas nuevas — se confirmó reproduciéndolo incluso en la home sin ningún cambio de código. `npm run build`/`npm run start` (producción) **no** tienen este problema, solo el servidor de desarrollo con Turbopack. Mientras no se resuelva ese bug/versión de Next-Turbopack, `package.json` fuerza el motor clásico de webpack para `dev` (`"dev": "next dev --webpack"`), que funciona igual de bien salvo por ser algo más lento para recompilar.

## 8. Limitaciones técnicas conocidas

- Almacenamiento de documentos **y de imágenes de promociones** en disco local del servidor de la API (`App_Data/documentos` y `App_Data/promociones`, cada uno con su propio volumen Docker — ver `docker-compose.yml`) — no apto para múltiples instancias sin un volumen persistente compartido (relevante al planear el despliegue a Azure: considerar Blob Storage).
- Cobertura de pruebas automatizadas es representativa, no exhaustiva (ver 4.7).
- El historial de auditoría cubre el ciclo de vida del caso (creación, estatus, checklist, citas ligadas, documentos, pagos, portal) — no absolutamente todas las mutaciones del sistema (ej. marcar un mensaje de contacto como atendido no se audita).
