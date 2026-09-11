# Manual de usuario — ECG Abogados

## 0. Los tres perfiles del sistema

- **Invitado**: cualquier visitante del sitio público. Puede leer sobre los servicios, agendar una asesoría o enviar un mensaje — sin necesidad de cuenta.
- **Personal del despacho** (Administrador/Asistente): inicia sesión en `/login`, gestiona leads, expedientes, agenda y documentos desde el panel interno.
- **Cliente**: alguien con un expediente abierto a quien la abogada le dio de alta una cuenta. Inicia sesión en `/cliente/login` y ve, de forma privada, el seguimiento de su propio caso (estatus, requisitos y documentos que la abogada va cargando).

## 1. Sitio público

Accesible en la raíz del sitio (`/`), sin necesidad de iniciar sesión. Cualquier visitante puede:

- Conocer los 11 servicios del despacho, agrupados en **Derecho familiar** (divorcio incausado, divorcio por mutuo consentimiento, pensión alimenticia, guarda y custodia, régimen de convivencias, violencia familiar) y **Asesoría fiscal y empresarial** (trámites ante el SAT, contratos, cobranza y pagarés, sucesiones y herencias, asesoría para empresas y emprendedores) — ver el índice completo en `/servicios`.
- **Agendar una asesoría** desde la pestaña "Agendar cita": nombre, teléfono y fecha/hora preferida.
- **Enviar un mensaje de contacto** desde la pestaña "Enviar mensaje": nombre, teléfono, correo (opcional) y mensaje.
- Contactar directamente por WhatsApp, teléfono o correo mediante los enlaces del sitio.

Cuando se agenda una cita o se envía un mensaje desde la página de un servicio específico (por ejemplo, desde `/servicios/tramites-sat`), el lead queda etiquetado con ese servicio para que el personal pueda identificarlo y filtrarlo en el panel.

## 2. Inicio de sesión del personal (`/login`)

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
| **Agenda** | `/agenda` | Calendario visual (mes/semana/día/lista) de todas las citas, coloreadas por estatus, con buscador por cliente/teléfono y filtro por servicio de interés. Agendar una nueva (opcionalmente ligada a un caso) y confirmar o cancelar al hacer clic en una cita. Cada cita tiene un botón **"Abrir WhatsApp"** que abre una conversación ya redactada con ese contacto. |
| **Mensajes** | `/mensajes` | Mensajes recibidos desde el formulario público, separados en "Pendientes" y "Atendidos", con paginación y filtro por servicio de interés. También con botón **"Abrir WhatsApp"** por mensaje. |
| **Clientes** | `/clientes` | Solo **Administrador**: dar de alta una cuenta de cliente (nombre, correo, contraseña temporal) para el portal autenticado, y activar/desactivar cuentas. La cuenta se vincula a un expediente concreto desde el detalle de ese caso. |
| **Usuarios** | `/usuarios` | Solo visible para el rol **Administrador**: dar de alta personal, editar nombre/rol/contraseña, y activar/desactivar cuentas. No puedes cambiar tu propio rol ni desactivarte a ti mismo. |

### Roles

- **Administrador**: acceso total, incluida la sección de Honorarios, Clientes, Usuarios, y la capacidad de cerrar un expediente.
- **Asistente**: gestiona casos, citas, checklist y plazos, pero no puede cerrar un expediente, ver información financiera, ni gestionar cuentas de Cliente o de personal.

### Portal del cliente por enlace mágico (sin necesidad de cuenta)

Cada expediente genera automáticamente un **enlace mágico** (botón "Copiar enlace" en el detalle del caso). Compártelo por WhatsApp con el cliente: podrá ver el estatus de su caso, su checklist de requisitos y subir documentos, sin registrarse ni tener contraseña. Este mecanismo sigue existiendo igual que antes, independiente del portal con cuenta descrito abajo.

### Vincular una cuenta de Cliente a un expediente

Desde el detalle de un caso (`/casos/{id}`), la tarjeta "Cuenta de cliente" permite seleccionar una cuenta ya creada en `/clientes` y vincularla a ese expediente. A partir de ese momento, ese cliente verá el caso al iniciar sesión en `/cliente/login`. Un mismo cliente puede tener varios expedientes vinculados, y los verá todos en su portal.

### Notificaciones automáticas

El sistema avisa por correo al despacho cuando: llega un mensaje de contacto, se agenda una cita, una cita confirmada está a menos de 24 horas, o un plazo/audiencia está por vencer. Requiere configurar una cuenta de correo gratuita (ver `MANUAL_TECNICO.md`).

## 3.1 Portal del Cliente con cuenta (`/cliente/login`)

Cuando un expediente avanza y la abogada decide darle seguimiento formal al cliente, le crea una cuenta desde `/clientes` y la vincula a su caso (ver arriba). El cliente entonces:

1. Entra a `/cliente/login` con el correo y la contraseña que le compartió la abogada.
2. Ve una pantalla con su nombre, y el estatus de su(s) expediente(s): tipo de trámite, estatus (activo/en revisión/cerrado), el checklist de requisitos (marcados conforme se van cumpliendo) y los documentos que la abogada haya subido a su caso.
3. Si tiene más de un expediente, puede elegir cuál ver desde un selector.
4. Puede cerrar sesión con el botón "Salir".

Este portal es de **solo lectura** para el cliente — la carga de documentos y la actualización del checklist las hace el personal desde el panel interno.

## 4. Estatus del negocio

- **Estatus de un caso:** `Activo`, `Revision` (en revisión), `Cerrado`.
- **Estatus de una cita:** `Pendiente`, `Confirmada`, `Cancelada`.
- **Mensaje de contacto:** `Atendido` (sí/no).

## 5. Flujo típico de trabajo

1. Un prospecto agenda una cita o envía un mensaje desde el sitio público (posiblemente desde la página de un servicio específico, como SAT).
2. El personal revisa **Mensajes** o **Agenda** en el panel, y usa el botón "Abrir WhatsApp" para platicar con el prospecto y confirmar la cita.
3. Si el caso avanza, se crea un expediente en **Casos** con los datos del cliente y el tipo de trámite (se genera automáticamente un checklist de requisitos según el trámite).
4. A lo largo del proceso se suben documentos al expediente y se actualiza su estatus.
5. Si el cliente necesita ver el seguimiento por su cuenta, la abogada le crea una cuenta en **Clientes** y la vincula al expediente, o comparte el enlace mágico del portal por WhatsApp.
6. Al concluir, el expediente se marca como **Cerrado**.
