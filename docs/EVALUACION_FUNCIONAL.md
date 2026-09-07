# Evaluación funcional y de mercado — EC Abogados

Evaluación desde cuatro perspectivas: gestión de despachos jurídicos, ingeniería de software, diseño UI/UX e integración de sistemas con personal/operación. Fecha de evaluación: 2026-09-07.

## 1. Como gestor de despacho jurídico

**Cubre lo esencial de un embudo de intake para un solo tipo de trámite:** captación (landing + formularios), agenda de asesorías y seguimiento de expediente con documentos y estatus. Para un despacho unipersonal o muy pequeño enfocado en un solo servicio (divorcio incausado), esto ya es más que una hoja de cálculo.

**Lo que le falta frente a un software de gestión legal real** (tipo Clio, MyCase, Rocket Matter):
- Sin control de conflictos de interés al dar de alta un cliente/caso.
- Sin numeración/folio de expediente, ni vínculo a tribunal/juzgado, número de expediente judicial o partes contrarias.
- Sin control de plazos procesales (términos legales, audiencias, prescripciones) — el calendario es solo una lista de citas de asesoría, no un calendario procesal con alertas.
- Sin facturación, control de horas, honorarios ni cuentas de cliente (trust accounting).
- Sin plantillas de documentos legales ni generación automática de escritos.
- Sin portal de cliente (el cliente no puede ver su propio expediente).
- Sin firma electrónica ni versión de documentos.
- Un solo rol de usuario (`Rol` existe en el modelo pero no hay permisos diferenciados reales en la lógica).

**Veredicto de esta perspectiva:** es una herramienta de **captación y seguimiento**, no un sistema de gestión legal (legal practice management) completo. Resuelve "no perder al cliente" pero no "gestionar el caso jurídicamente".

## 2. Como ingeniero de software

**Fortalezas:**
- Arquitectura limpia bien aplicada (Domain/Application/Infrastructure/Api) con CQRS vía MediatR — separación de responsabilidades correcta y patrón consistente en todas las features.
- Autenticación JWT + BCrypt implementada de forma estándar y correcta.
- Frontend simple, legible, sin sobre-ingeniería de estado (adecuado para el tamaño actual).
- Base de código consistente en nomenclatura y estructura; fácil de entender para alguien nuevo.

**Debilidades:**
- Cero pruebas automatizadas (unitarias, integración, e2e).
- Sin CI/CD.
- Secreto JWT y cadena de conexión en texto plano en `appsettings.json` versionado.
- Sin manejo de roles/autorización granular (`[Authorize]` es binario: autenticado o no).
- Almacenamiento de archivos en disco local — no escala horizontalmente y es un riesgo de pérdida de datos sin backup explícito.
- Sin logging/observabilidad más allá del logger por defecto de ASP.NET.
- Sin migraciones de base de datos (EF Migrations o similar); el esquema se aplica con un script SQL manual.

**Veredicto de esta perspectiva:** código de **calidad de MVP sólido**, con buenas bases arquitectónicas para crecer, pero le faltan las prácticas de "producto en producción" (tests, CI/CD, gestión de secretos, observabilidad).

## 3. Como diseñador UI/UX

**Fortalezas:**
- Identidad visual coherente y cuidada (paleta dorado/tinta, tipografía con acento personal — `font-script` para el eslogan), transmite la seriedad y calidez esperada de un despacho familiar.
- Landing con jerarquía clara: propuesta de valor → proceso → beneficios → contacto, sin fricción para agendar.
- Panel interno limpio, sin ruido visual, consistente en todas las vistas (mismo lenguaje de tarjetas, tablas y pills de estatus).
- Responsive básico correcto (sidebar colapsable en móvil).

**Debilidades:**
- Contraste y accesibilidad no auditados (textos dorado/crema sobre fondo oscuro pueden fallar WCAG AA en varios elementos).
- Sin estados vacíos/hint más allá de texto plano ("Sin casos activos.") — se pierde oportunidad de guiar la siguiente acción.
- La agenda es una tabla, no una vista de calendario — para el caso de uso (citas por fecha/hora) un calendario semanal sería muchísimo más usable.
- No hay confirmaciones destructivas (cancelar una cita es un clic sin confirmación) ni feedback de éxito consistente (algunas acciones no muestran toast/mensaje de éxito).
- Sin modo claro; asume que todo el personal prefiere tema oscuro.
- No se evaluó accesibilidad de teclado/lector de pantalla.

**Veredicto de esta perspectiva:** buen **diseño de marca**, ejecución de **UI pulida** para su tamaño, pero la **UX operativa** (la que usa el staff todos los días) tiene oportunidades claras de mejora, especialmente en la agenda.

## 4. Como experto en integraciones de sistemas y personal

**Estado actual:** el sistema es una isla. No se integra con:
- Calendario externo (Google Calendar/Outlook) — las citas no se sincronizan a ningún calendario real del abogado.
- WhatsApp/SMS/email — no hay notificaciones automáticas al cliente ni al staff (confirmar cita, recordatorio, mensaje nuevo). Todo el seguimiento de mensajes/citas es manual dentro del panel.
- Sistema de nómina/RH — no aplica gestión de personal más allá de un campo `Rol` sin uso funcional.
- Firma electrónica o gestores documentales externos (Google Drive, SharePoint, DocuSign).
- Ningún webhook, API pública para terceros, ni exportación de datos (CSV/Excel).

**Impacto operativo:** cada notificación al cliente depende de que alguien del staff entre al panel, vea el mensaje/cita y responda manualmente por WhatsApp aparte. El sistema **registra** pero no **automatiza** la comunicación.

**Veredicto de esta perspectiva:** para un despacho que crezca a más de una persona atendiendo, la ausencia de integraciones (especialmente recordatorios automáticos y sincronización de calendario) se va a sentir rápido como cuello de botella operativo.

---

## Veredicto general: ¿qué tan funcional es en el mercado?

**No es un producto de mercado (SaaS vendible a otros despachos) — es una herramienta interna a la medida de un despacho específico.**

| Dimensión | Nivel |
|---|---|
| Madurez de producto | MVP funcional, no producción-ready |
| Comparación vs. software legal comercial (Clio, MyCase) | Cubre ~15-20% del alcance típico |
| Calidad de ingeniería | Buena base arquitectónica, sin prácticas de producto maduro (tests, CI/CD, secretos) |
| Diseño / marca | Fuerte y diferenciado |
| UX operativa diaria | Funcional pero con fricción evitable |
| Preparación para integraciones | Ninguna; diseñado como sistema cerrado |
| Multi-tenant / reventa a otros despachos | No — está modelado 1:1 para este despacho y este trámite |

**Si el objetivo es uso interno de este despacho:** es una herramienta útil y con buena base para seguir invirtiendo — soluciona el problema real de "no perder leads" y centralizar expedientes.

**Si el objetivo fuera venderlo como producto a otros despachos:** requeriría una inversión considerable — multi-tenancy, roles reales, facturación, calendario procesal, integraciones de notificación, pruebas automatizadas y hardening de seguridad — antes de ser competitivo frente a las soluciones ya establecidas del mercado legal.
