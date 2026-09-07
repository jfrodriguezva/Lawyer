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

## 3. Panel interno

| Sección | Ruta | Qué permite |
|---|---|---|
| **Panel de casos** | `/dashboard` | Ver resumen: casos activos, en revisión y próximas citas, con accesos rápidos a cada uno. |
| **Casos** | `/casos` | Listar todos los expedientes y crear uno nuevo (cliente, tipo de caso, notas iniciales). |
| **Detalle de caso** | `/casos/{id}` | Ver notas del expediente, cambiar su estatus (Activo / En revisión / Cerrado) y subir/consultar documentos (hasta 50 MB por archivo). |
| **Agenda** | `/agenda` | Ver todas las citas ordenadas por fecha, agendar una nueva (opcionalmente ligada a un caso existente) y confirmar o cancelar citas. |
| **Mensajes** | `/mensajes` | Ver los mensajes recibidos desde el formulario público, separados en "Pendientes" y "Atendidos", y marcarlos como atendidos. |

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
