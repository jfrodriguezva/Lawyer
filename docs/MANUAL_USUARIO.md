# Manual de usuario — EC Abogados

## 1. Sitio público

Accesible en la raíz del sitio (`/`), sin necesidad de iniciar sesión. Cualquier visitante puede:

- Leer sobre el servicio de divorcio incausado, el proceso en 3 pasos y los beneficios del despacho.
- **Agendar una asesoría** desde la pestaña "Agendar cita": nombre, teléfono y fecha/hora preferida.
- **Enviar un mensaje de contacto** desde la pestaña "Enviar mensaje": nombre, teléfono, correo (opcional) y mensaje.
- Contactar directamente por WhatsApp, teléfono o correo mediante los enlaces del sitio.

## 2. Inicio de sesión (`/login`)

Acceso exclusivo para el personal del despacho, con correo y contraseña. Al iniciar sesión correctamente se guarda la sesión y se redirige automáticamente al panel (`/dashboard`).

Si la sesión no existe o expira, cualquier intento de entrar a una sección del panel redirige de vuelta a `/login`.

Por seguridad, después de 5 intentos fallidos seguidos la cuenta se bloquea temporalmente durante 15 minutos (aunque después se escriba la contraseña correcta).

### ¿Olvidaste tu contraseña?

En `/login`, el enlace "¿Olvidaste tu contraseña?" abre un formulario donde escribes tu correo. Si el correo existe, recibirás un mensaje con un enlace para elegir una nueva contraseña (válido por 1 hora). Por seguridad, el sistema siempre muestra el mismo aviso de "enlace enviado", exista o no esa cuenta.

## 3. Panel interno

| Sección | Ruta | Qué permite |
|---|---|---|
| **Panel de casos** | `/dashboard` | Resumen: casos activos, en revisión, próximas citas, casos cerrados, tasa de confirmación de citas y % de mensajes atendidos. |
| **Casos** | `/casos` | Listar todos los expedientes (con búsqueda por cliente/tipo y paginación) y crear uno nuevo (cliente, tipo de caso, notas iniciales). Al crearlo se genera automáticamente un checklist de requisitos según el tipo de trámite. |
| **Detalle de caso** | `/casos/{id}` | Notas, checklist de requisitos, documentos (solo se aceptan PDF, Word, Excel o imágenes, hasta 50 MB), plazos/audiencias, cambio de estatus, y el enlace del portal del cliente. Si tu cuenta es **Administrador** también ves y registras **Honorarios**, y ves el **Historial** de todo lo que ha pasado con el caso (quién hizo qué y cuándo). |
| **Agenda** | `/agenda` | Calendario visual (mes/semana/día/lista) de todas las citas, coloreadas por estatus, con buscador por cliente/teléfono. Agendar una nueva (opcionalmente ligada a un caso) y confirmar o cancelar al hacer clic en una cita. |
| **Mensajes** | `/mensajes` | Mensajes recibidos desde el formulario público, separados en "Pendientes" y "Atendidos", con paginación. |
| **Usuarios** | `/usuarios` | Solo visible para el rol **Administrador**: dar de alta personal, editar nombre/rol/contraseña, y activar/desactivar cuentas. No puedes cambiar tu propio rol ni desactivarte a ti mismo. |

### Roles

- **Administrador**: acceso total, incluida la sección de Honorarios y la capacidad de cerrar un expediente.
- **Asistente**: gestiona casos, citas, checklist y plazos, pero no puede cerrar un expediente ni ver información financiera.

### Portal del cliente (sin necesidad de cuenta)

Cada expediente genera automáticamente un **enlace mágico** (botón "Copiar enlace" en el detalle del caso). Compártelo por WhatsApp con el cliente: podrá ver el estatus de su caso, su checklist de requisitos y subir documentos, sin registrarse ni tener contraseña.

### Notificaciones automáticas

El sistema avisa por correo al despacho cuando: llega un mensaje de contacto, se agenda una cita, una cita confirmada está a menos de 24 horas, o un plazo/audiencia está por vencer. Requiere configurar una cuenta de correo gratuita (ver `MANUAL_TECNICO.md`).

## 4. Estatus del negocio

- **Estatus de un caso:** `Activo`, `Revision` (en revisión), `Cerrado`.
- **Estatus de una cita:** `Pendiente`, `Confirmada`, `Cancelada`.
- **Mensaje de contacto:** `Atendido` (sí/no).

## 5. Flujo típico de trabajo

1. Un prospecto agenda una cita o envía un mensaje desde el sitio público.
2. El personal revisa **Mensajes** o **Agenda** en el panel y confirma o da seguimiento.
3. Si el caso avanza, se crea un expediente en **Casos** con los datos del cliente.
4. A lo largo del proceso se suben documentos al expediente y se actualiza su estatus.
5. Al concluir, el expediente se marca como **Cerrado**.
