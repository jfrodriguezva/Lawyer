import { getCookie } from "./cookies";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export type EstatusCaso = "Activo" | "Revision" | "Cerrado";
export type EstatusCita = "Pendiente" | "Confirmada" | "Realizada" | "Cancelada" | "NoAsistio";
export type ModuloSolicitud = "Abogado" | "SAT";
export type ModalidadCita = "Presencial" | "Videollamada" | "Llamada";
export type EstatusSolicitudCita =
  | "SolicitudRecibida"
  | "EnRevision"
  | "InformacionRequerida"
  | "HorarioAlternativoPropuesto"
  | "PendienteConfirmacionSolicitante"
  | "Confirmada"
  | "Realizada"
  | "Cancelada"
  | "NoAsistio"
  | "Rechazada"
  | "ConvertidaEnContratacion";
export type AccionRevisionSolicitud = "Aceptar" | "ProponerOtroHorario" | "Rechazar" | "PedirInformacion";
export type RespuestaSolicitante = "AceptarHorario" | "SolicitarOtroHorario";
export type EtapaProspecto = "Nuevo" | "EnRevision" | "EntrevistaRealizada" | "Contratado" | "NoContratado";
export type EstatusConflictoInteres = "Pendiente" | "Revisado" | "Autorizado" | "Rechazado";
export type VisibilidadDocumento = "Interno" | "Compartido" | "SubidoPorCliente";
export type EstatusDocumento = "Pendiente" | "Recibido" | "EnRevision" | "Aceptado" | "Rechazado" | "RequiereCorreccion";
export type VisibilidadActualizacion = "Interna" | "Compartida";
export type TipoPersona = "Fisica" | "Moral";
export type TipoPago = "Anticipo" | "Pago" | "Ajuste";
export type DestinatarioTipo = "Usuario" | "Cliente";
export type EstatusTramiteSAT = "Pendiente" | "EnProceso" | "EsperandoCliente" | "Completado" | "Cancelado";

export interface Flags {
  satHabilitado: boolean;
  comercializadoraHabilitada: boolean;
}

export interface CatalogoTramiteSAT {
  id: number;
  nombre: string;
  requisitos: string | null;
  etapas: string | null;
  observaciones: string | null;
  activo: boolean;
}

export interface TramiteSAT {
  id: number;
  clienteId: number;
  clienteNombre: string | null;
  catalogoTramiteId: number;
  catalogoTramiteNombre: string | null;
  estatus: EstatusTramiteSAT;
  responsableUsuarioId: number | null;
  responsableNombre: string | null;
  fechaLimite: string | null;
  observaciones: string | null;
  fechaCreacion: string;
}

export interface Caso {
  id: number;
  clienteNombre: string;
  tipo: string;
  estatus: EstatusCaso;
  fechaApertura: string;
  notas: string | null;
  abogadoResponsableId: number | null;
  abogadoResponsableNombre: string | null;
  prioridad: string | null;
  folioInterno: string | null;
  archivado: boolean;
}

export interface ChecklistItem {
  id: number;
  casoId: number;
  descripcion: string;
  completado: boolean;
}

export interface Plazo {
  id: number;
  casoId: number;
  descripcion: string;
  fechaLimite: string;
  cumplido: boolean;
}

export interface Pago {
  id: number;
  casoId: number;
  concepto: string;
  monto: number;
  fecha: string;
  tipo: TipoPago;
}

export interface TareaCaso {
  id: number;
  casoId: number;
  descripcion: string;
  responsableUsuarioId: number | null;
  responsableNombre: string | null;
  fechaVencimiento: string | null;
  completada: boolean;
  fechaCreacion: string;
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  enlace: string | null;
}

export interface PlantillaMensaje {
  id: number;
  nombre: string;
  contenido: string;
}

export interface RegistroTiempo {
  id: number;
  casoId: number;
  usuarioId: number;
  usuarioNombre: string | null;
  minutos: number;
  descripcion: string | null;
  fecha: string;
}

export interface ReporteCasos {
  totalCasos: number;
  porEstatus: Record<string, number>;
  porTipo: Record<string, number>;
  porAbogado: Record<string, number>;
  casos: Caso[];
}

export interface AuditoriaGlobalEntry {
  id: number;
  entidad: string;
  entidadId: number;
  accion: string;
  detalle: string | null;
  usuarioNombre: string | null;
  fecha: string;
  ip: string | null;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  email: string;
  nombre: string;
  activo: boolean;
  tipoPersona: TipoPersona;
  rfc: string | null;
  telefono: string | null;
  invitacionPendiente: boolean;
  fechaCreacion: string;
}

export interface ActualizacionCaso {
  id: number;
  casoId: number;
  texto: string;
  visibilidad: VisibilidadActualizacion;
  usuarioNombre: string | null;
  fecha: string;
}

export interface CasoDetalle extends Caso {
  tokenAcceso: string | null;
  tokenGeneradoEn: string | null;
  citas: Cita[];
  documentos: Documento[];
  checklist: ChecklistItem[];
  clienteVinculadoId: number | null;
  clienteVinculadoNombre: string | null;
  clienteVinculadoEmail: string | null;
  contraparteNombre: string | null;
  autoridadOrganismo: string | null;
  numeroExpedienteExterno: string | null;
  fechaCierre: string | null;
  motivoCierre: string | null;
  montoAcordado: number | null;
  actualizaciones: ActualizacionCaso[];
  tareas: TareaCaso[];
}

export interface Prospecto {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  medioContactoPreferido: string | null;
  origen: string | null;
  servicioInteres: string | null;
  conflictoInteres: EstatusConflictoInteres;
  responsableUsuarioId: number | null;
  resultadoEntrevista: string | null;
  etapa: EtapaProspecto;
  motivoNoContratacion: string | null;
  clienteId: number | null;
  fechaCreacion: string;
}

export interface HistorialCitaCambio {
  id: number;
  fechaHoraPropuesta: string;
  propuestoPor: "Staff" | "Solicitante";
  motivo: string | null;
  fecha: string;
}

export interface SolicitudCita {
  id: number;
  prospectoId: number | null;
  clienteId: number | null;
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  medioContactoPreferido: string | null;
  modulo: ModuloSolicitud;
  servicioInteres: string | null;
  descripcion: string | null;
  fechaHoraPropuesta: string;
  modalidad: ModalidadCita;
  estatus: EstatusSolicitudCita;
  responsableUsuarioId: number | null;
  motivo: string | null;
  citaId: number | null;
  fechaCreacion: string;
  historial: HistorialCitaCambio[];
}

export interface SolicitudCitaPublica {
  nombreSolicitante: string;
  modulo: ModuloSolicitud;
  servicioInteres: string | null;
  fechaHoraPropuesta: string;
  modalidad: ModalidadCita;
  estatus: EstatusSolicitudCita;
  motivo: string | null;
}

export interface ProspectoDetalle {
  prospecto: Prospecto;
  solicitudes: SolicitudCita[];
}

export interface AuditoriaEntry {
  id: number;
  accion: string;
  detalle: string | null;
  usuarioNombre: string | null;
  fecha: string;
}

export interface PortalCaso {
  id: number;
  clienteNombre: string;
  tipo: string;
  estatus: EstatusCaso;
  fechaApertura: string;
  checklist: ChecklistItem[];
  documentos: Documento[];
  actualizaciones: ActualizacionCaso[];
  proximasCitas: Cita[];
}

export interface Cita {
  id: number;
  casoId: number | null;
  nombreCliente: string;
  telefono: string;
  fechaHora: string;
  estatus: EstatusCita;
  servicioInteres: string | null;
}

export interface Documento {
  id: number;
  casoId: number;
  nombreArchivo: string;
  tipoContenido: string;
  tamanoBytes: number;
  fechaCarga: string;
  descripcion: string | null;
  categoria: string | null;
  visibilidad: VisibilidadDocumento;
  estatus: EstatusDocumento;
  comentarioRevision: string | null;
  version: number;
  subidoPorTipo: "Staff" | "Cliente";
  subidoPorNombre: string | null;
  soloRegistro: boolean;
}

export interface LoginResponse {
  token: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface MensajeContacto {
  id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  mensaje: string;
  fechaEnvio: string;
  atendido: boolean;
  servicioInteres: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Cookie que firma la sesión: "ec_token" para staff (Abogado/Consultor/Agente/
// Administrador), "ecg_cliente_token" para el portal de Cliente. Un solo
// wrapper parametrizado evita mantener dos copias casi idénticas del cliente HTTP.
type SesionCookie = "ec_token" | "ecg_cliente_token";

async function request<T>(
  path: string,
  options: RequestInit = {},
  cookieName: SesionCookie = "ec_token"
): Promise<T> {
  const token = getCookie(cookieName);
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = data?.message ?? data?.title ?? message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// ---- Auth ----

export function login(email: string, password: string) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function olvidePassword(email: string) {
  return request<{ message: string }>("/api/auth/olvide-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function restablecerPassword(token: string, nuevaPassword: string) {
  return request<void>("/api/auth/restablecer-password", {
    method: "POST",
    body: JSON.stringify({ token, nuevaPassword }),
  });
}

// ---- Casos ----

export function getCasos() {
  return request<Caso[]>("/api/casos");
}

export function getCasosPaginado(page: number, pageSize: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set("search", search);
  return request<PagedResult<Caso>>(`/api/casos/pagina?${params.toString()}`);
}

export function getCaso(id: number | string) {
  return request<CasoDetalle>(`/api/casos/${id}`);
}

export interface DatosCaso {
  clienteNombre: string;
  tipo: string;
  notas?: string | null;
  abogadoResponsableId?: number | null;
  prioridad?: string | null;
  folioInterno?: string | null;
  contraparteNombre?: string | null;
  autoridadOrganismo?: string | null;
  numeroExpedienteExterno?: string | null;
  montoAcordado?: number | null;
}

export function createCaso(data: DatosCaso) {
  return request<{ id: number }>("/api/casos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCaso(id: number | string, data: DatosCaso) {
  return request<void>(`/api/casos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarEstatusCaso(id: number | string, estatus: EstatusCaso, motivo?: string) {
  return request<void>(`/api/casos/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ estatus, motivo }),
  });
}

export function getActualizacionesCaso(id: number | string) {
  return request<ActualizacionCaso[]>(`/api/casos/${id}/actualizaciones`);
}

export function crearActualizacionCaso(id: number | string, texto: string, visibilidad: VisibilidadActualizacion) {
  return request<{ id: number }>(`/api/casos/${id}/actualizaciones`, {
    method: "POST",
    body: JSON.stringify({ texto, visibilidad }),
  });
}

export function regenerarTokenCaso(id: number | string) {
  return request<{ token: string }>(`/api/casos/${id}/regenerar-token`, {
    method: "POST",
  });
}

export function vincularClienteACaso(id: number | string, clienteId: number) {
  return request<void>(`/api/casos/${id}/vincular-cliente`, {
    method: "POST",
    body: JSON.stringify({ clienteId }),
  });
}

// ---- Citas ----

export function getCitas() {
  return request<Cita[]>("/api/citas");
}

export function createCita(data: {
  casoId?: number | null;
  nombreCliente: string;
  telefono: string;
  fechaHora: string;
  servicioInteres?: string | null;
}) {
  return request<{ id: number }>("/api/citas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cambiarEstatusCita(id: number | string, estatus: EstatusCita) {
  return request<void>(`/api/citas/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ estatus }),
  });
}

// ---- Documentos ----

export function getDocumentosPorCaso(casoId: number | string) {
  return request<Documento[]>(`/api/documentos/caso/${casoId}`);
}

export function subirDocumento(
  casoId: number | string,
  file: File,
  opciones?: { descripcion?: string; visibilidad?: VisibilidadDocumento }
) {
  const formData = new FormData();
  formData.append("CasoId", String(casoId));
  formData.append("File", file);
  if (opciones?.descripcion) formData.append("Descripcion", opciones.descripcion);
  if (opciones?.visibilidad) formData.append("Visibilidad", opciones.visibilidad);
  return request<{ id: number }>("/api/documentos", {
    method: "POST",
    body: formData,
  });
}

export function cambiarEstatusDocumento(id: number | string, estatus: EstatusDocumento, comentarioRevision?: string | null) {
  return request<void>(`/api/documentos/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ estatus, comentarioRevision }),
  });
}

// La descarga requiere el token del staff (Authorization header), así que no
// puede ser un <a href> plano: se trae el archivo autenticado y se dispara
// la descarga en el navegador con un blob temporal.
export async function descargarDocumento(id: number | string, nombreArchivo: string) {
  const token = getCookie("ec_token");
  const res = await fetch(`${API_URL}/api/documentos/${id}/descargar`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new ApiError(`Error ${res.status}`, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(url);
}

// ---- Contacto ----

export function enviarMensajeContacto(data: {
  nombre: string;
  telefono: string;
  email?: string | null;
  mensaje: string;
  servicioInteres?: string | null;
}) {
  return request<{ id: number }>("/api/contacto", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMensajesContacto() {
  return request<MensajeContacto[]>("/api/contacto");
}

export function getMensajesContactoPaginado(page: number, pageSize: number) {
  return request<PagedResult<MensajeContacto>>(`/api/contacto/pagina?page=${page}&pageSize=${pageSize}`);
}

export function marcarMensajeAtendido(id: number | string) {
  return request<void>(`/api/contacto/${id}/atendido`, {
    method: "PATCH",
  });
}

// ---- Checklist ----

export function marcarChecklistItem(itemId: number | string, completado: boolean) {
  return request<void>(`/api/casos/checklist/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ completado }),
  });
}

// ---- Plazos ----

export function getPlazosPorCaso(casoId: number | string) {
  return request<Plazo[]>(`/api/plazos/caso/${casoId}`);
}

export function crearPlazo(data: { casoId: number; descripcion: string; fechaLimite: string }) {
  return request<{ id: number }>("/api/plazos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function marcarPlazoCumplido(id: number | string, cumplido: boolean) {
  return request<void>(`/api/plazos/${id}/cumplido`, {
    method: "PATCH",
    body: JSON.stringify({ cumplido }),
  });
}

// ---- Pagos (honorarios) ----

export function getPagosPorCaso(casoId: number | string) {
  return request<Pago[]>(`/api/pagos/caso/${casoId}`);
}

export function registrarPago(data: { casoId: number; concepto: string; monto: number; tipo?: TipoPago }) {
  return request<{ id: number }>("/api/pagos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Usuarios (staff) ----

export function getUsuarios() {
  return request<Usuario[]>("/api/usuarios");
}

export interface DirectorioUsuario {
  id: number;
  nombre: string;
}

// Solo Id + Nombre: para Abogado/Consultor eligiendo un responsable, sin
// exponer el directorio administrativo completo (exclusivo de Administrador).
export function getDirectorioUsuarios() {
  return request<DirectorioUsuario[]>("/api/usuarios/directorio");
}

export function crearUsuario(data: { email: string; password: string; nombre: string; rol: string }) {
  return request<{ id: number }>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cambiarEstatusUsuario(id: number | string, activo: boolean) {
  return request<void>(`/api/usuarios/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

export function actualizarUsuario(
  id: number | string,
  data: { nombre: string; rol: string; nuevaPassword?: string | null }
) {
  return request<void>(`/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ---- Clientes (cuentas del portal autenticado) ----

export function getClientes() {
  return request<Cliente[]>("/api/clientes");
}

export function crearCliente(data: { email: string; password: string; nombre: string }) {
  return request<{ id: number }>("/api/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cambiarEstatusCliente(id: number | string, activo: boolean) {
  return request<void>(`/api/clientes/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

// ---- Auditoría (historial de cambios) ----

export function getAuditoriaPorCaso(casoId: number | string) {
  return request<AuditoriaEntry[]>(`/api/auditoria/caso/${casoId}`);
}

export function getAuditoriaGlobal(page: number, pageSize: number, entidad?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (entidad) params.set("entidad", entidad);
  return request<PagedResult<AuditoriaGlobalEntry>>(`/api/auditoria?${params.toString()}`);
}

// ---- Portal del cliente (enlace mágico, sin autenticación) ----

export function getCasoPorToken(token: string) {
  return request<PortalCaso>(`/api/portal/${token}`);
}

export function subirDocumentoPortal(token: string, file: File) {
  const formData = new FormData();
  formData.append("File", file);
  return request<{ id: number }>(`/api/portal/${token}/documentos`, {
    method: "POST",
    body: formData,
  });
}

// ---- Portal del Cliente autenticado (cuenta real, cookie ecg_cliente_token) ----

export function loginCliente(email: string, password: string) {
  return request<LoginResponse>("/api/cliente/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function aceptarInvitacionCliente(token: string, nuevaPassword: string) {
  return request<void>("/api/cliente/aceptar-invitacion", {
    method: "POST",
    body: JSON.stringify({ token, nuevaPassword }),
  });
}

export function getMisCasos() {
  return request<PortalCaso[]>("/api/cliente/mis-casos", {}, "ecg_cliente_token");
}

export function subirDocumentoClientePortal(casoId: number | string, file: File) {
  const formData = new FormData();
  formData.append("File", file);
  return request<{ id: number }>(`/api/cliente/casos/${casoId}/documentos`, {
    method: "POST",
    body: formData,
  }, "ecg_cliente_token");
}

// ---- Invitación de cliente (alta sin contraseña) ----

export function invitarCliente(data: { email: string; nombre: string; prospectoId?: number | null }) {
  return request<{ id: number }>("/api/clientes/invitar", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Prospectos ----

export function getProspectos() {
  return request<Prospecto[]>("/api/prospectos");
}

export function getProspecto(id: number | string) {
  return request<ProspectoDetalle>(`/api/prospectos/${id}`);
}

export function registrarResultadoEntrevista(
  id: number | string,
  data: { resultadoEntrevista: string; conflictoInteres: EstatusConflictoInteres; motivoNoContratacion?: string | null }
) {
  return request<void>(`/api/prospectos/${id}/entrevista`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ConvertirProspectoResultado {
  clienteId: number;
  casoId: number;
}

export function convertirProspecto(
  id: number | string,
  data: {
    tipoCaso: string;
    notasCaso?: string | null;
    abogadoResponsableId?: number | null;
    prioridad?: string | null;
    password?: string | null;
  }
) {
  return request<ConvertirProspectoResultado>(`/api/prospectos/${id}/convertir`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Solicitudes de cita (negociación pública <-> despacho) ----

export function crearSolicitudCita(data: {
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  medioContactoPreferido?: string | null;
  modulo: ModuloSolicitud;
  servicioInteres?: string | null;
  descripcion?: string | null;
  fechaHoraPropuesta: string;
  modalidad: ModalidadCita;
  aceptoAvisoPrivacidad: boolean;
}) {
  return request<{ id: number; tokenPublico: string }>("/api/solicitudes-cita", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getSolicitudesCita() {
  return request<SolicitudCita[]>("/api/solicitudes-cita");
}

export function revisarSolicitudCita(
  id: number | string,
  data: { accion: AccionRevisionSolicitud; nuevaFechaHora?: string | null; motivo?: string | null }
) {
  return request<void>(`/api/solicitudes-cita/${id}/revisar`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getSolicitudPorToken(token: string) {
  return request<SolicitudCitaPublica>(`/api/solicitudes-cita/${token}`);
}

export function responderHorarioAlternativo(
  token: string,
  data: { respuesta: RespuestaSolicitante; nuevaFechaHoraPropuesta?: string | null }
) {
  return request<void>(`/api/solicitudes-cita/${token}/responder`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---- Tareas ----

export function getTareasPorCaso(casoId: number | string) {
  return request<TareaCaso[]>(`/api/tareas/caso/${casoId}`);
}

export function getTareasPendientes() {
  return request<TareaCaso[]>("/api/tareas/pendientes");
}

export function crearTarea(data: { casoId: number; descripcion: string; responsableUsuarioId?: number | null; fechaVencimiento?: string | null }) {
  return request<{ id: number }>("/api/tareas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function marcarTareaCompletada(id: number | string, completada: boolean) {
  return request<void>(`/api/tareas/${id}/completada`, {
    method: "PATCH",
    body: JSON.stringify({ completada }),
  });
}

// ---- Notificaciones ----

export function getNotificaciones() {
  return request<Notificacion[]>("/api/notificaciones");
}

export function marcarNotificacionLeida(id: number | string) {
  return request<void>(`/api/notificaciones/${id}/leida`, { method: "PATCH" });
}

export function marcarTodasNotificacionesLeidas() {
  return request<void>("/api/notificaciones/marcar-todas-leidas", { method: "PATCH" });
}

// ---- Plantillas de mensaje ----

export function getPlantillas() {
  return request<PlantillaMensaje[]>("/api/plantillas");
}

export function crearPlantilla(data: { nombre: string; contenido: string }) {
  return request<{ id: number }>("/api/plantillas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function actualizarPlantilla(id: number | string, data: { nombre: string; contenido: string }) {
  return request<void>(`/api/plantillas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function eliminarPlantilla(id: number | string) {
  return request<void>(`/api/plantillas/${id}`, { method: "DELETE" });
}

// ---- Registro de tiempo dedicado ----

export function getTiempoPorCaso(casoId: number | string) {
  return request<RegistroTiempo[]>(`/api/registros-tiempo/caso/${casoId}`);
}

export function registrarTiempo(data: { casoId: number; minutos: number; descripcion?: string | null }) {
  return request<{ id: number }>("/api/registros-tiempo", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Reportes ----

export function getReporteCasos(filtros: {
  desde?: string | null;
  hasta?: string | null;
  abogadoResponsableId?: number | null;
  tipo?: string | null;
  estatus?: EstatusCaso | null;
}) {
  const params = new URLSearchParams();
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);
  if (filtros.abogadoResponsableId) params.set("abogadoResponsableId", String(filtros.abogadoResponsableId));
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.estatus) params.set("estatus", filtros.estatus);
  return request<ReporteCasos>(`/api/reportes/casos?${params.toString()}`);
}

// ---- Perfil (autoservicio) ----

export function actualizarMiPerfil(data: { nombre: string; passwordActual?: string | null; nuevaPassword?: string | null }) {
  return request<void>("/api/perfil", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ---- Configuración / feature flags (SAT, Comercializadora) ----

export function getFlags() {
  return request<Flags>("/api/configuracion/flags");
}

export function actualizarFlag(clave: string, valor: boolean) {
  return request<void>(`/api/configuracion/flags/${clave}`, {
    method: "PATCH",
    body: JSON.stringify({ valor }),
  });
}

// ---- Catálogo de trámites SAT (Administrador) ----

export function getCatalogoSAT() {
  return request<CatalogoTramiteSAT[]>("/api/catalogo-sat");
}

export function crearTramiteCatalogo(data: { nombre: string; requisitos?: string | null; etapas?: string | null; observaciones?: string | null }) {
  return request<{ id: number }>("/api/catalogo-sat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function actualizarTramiteCatalogo(id: number | string, data: { nombre: string; requisitos?: string | null; etapas?: string | null; observaciones?: string | null }) {
  return request<void>(`/api/catalogo-sat/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarEstatusTramiteCatalogo(id: number | string, activo: boolean) {
  return request<void>(`/api/catalogo-sat/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

// ---- Seguimiento de trámites SAT por cliente (Consultor) ----

export function getTramitesSAT() {
  return request<TramiteSAT[]>("/api/tramites-sat");
}

export function getTramitesSATPorCliente(clienteId: number | string) {
  return request<TramiteSAT[]>(`/api/tramites-sat/cliente/${clienteId}`);
}

export function crearTramiteSAT(data: { clienteId: number; catalogoTramiteId: number; responsableUsuarioId?: number | null; fechaLimite?: string | null; observaciones?: string | null }) {
  return request<{ id: number }>("/api/tramites-sat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function actualizarTramiteSAT(id: number | string, data: { estatus: EstatusTramiteSAT; responsableUsuarioId?: number | null; fechaLimite?: string | null; observaciones?: string | null }) {
  return request<void>(`/api/tramites-sat/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getMisTramitesSAT() {
  return request<TramiteSAT[]>("/api/cliente/mis-tramites-sat", {}, "ecg_cliente_token");
}

// ---- Módulos (Administrador) ----
// "Categoría padre" del catálogo público (Abogado, SAT, Comercializadora y las
// que se agreguen). getModulosActivos/getServiciosActivos/getPromocionesActivasPublic
// NO pasan por request(): éste depende de getCookie (document.cookie), que no
// existe en Server Components — estas funciones deben poder llamarse desde
// componentes de servidor (app/servicios/[slug]/page.tsx) y desde el cliente
// (GuestHeader) por igual.

export const RolesResponsablesModulo = ["Abogado", "Consultor", "Agente"] as const;
export type RolResponsableModulo = (typeof RolesResponsablesModulo)[number];

export interface Modulo {
  id: number;
  nombre: string;
  slug: string;
  rolResponsable: RolResponsableModulo;
  activo: boolean;
  orden: number;
}

async function publicFetch<T>(path: string, revalidateSeconds = 60): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    throw new ApiError(`Error ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

// Devuelve TODOS los módulos (no solo activos): el sitio público necesita
// conocer también los inactivos para mostrarlos como "Próximamente".
export function getModulosPublicos() {
  return publicFetch<Modulo[]>("/api/modulos/activos");
}

export function getModulos() {
  return request<Modulo[]>("/api/modulos");
}

export function crearModulo(data: { nombre: string; slug: string; rolResponsable: RolResponsableModulo; orden: number }) {
  return request<{ id: number }>("/api/modulos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function actualizarModulo(id: number | string, data: { nombre: string; slug: string; rolResponsable: RolResponsableModulo; orden: number }) {
  return request<void>(`/api/modulos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarActivoModulo(id: number | string, activo: boolean) {
  return request<void>(`/api/modulos/${id}/activo`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

export function eliminarModulo(id: number | string) {
  return request<void>(`/api/modulos/${id}`, { method: "DELETE" });
}

// ---- Servicios (Administrador) ----
// Reemplaza el catálogo que antes vivía hardcodeado en lib/servicios.ts.

export type IconoBeneficio =
  | "scale" | "gavel" | "document" | "family" | "clock" | "lock" | "handHeart" | "pin" | "money" | "briefcase" | "calculator";

export interface BeneficioServicio {
  icono: IconoBeneficio;
  titulo: string;
  texto: string;
}

export interface PasoProcesoServicio {
  numero: string;
  titulo: string;
  texto: string;
}

export interface Servicio {
  id: number;
  moduloId: number;
  slug: string;
  titulo: string;
  frase: string | null;
  descripcion: string;
  tipo: string | null;
  beneficios: BeneficioServicio[];
  proceso: PasoProcesoServicio[];
  activo: boolean;
  orden: number;
}

export interface ServicioInput {
  moduloId: number;
  slug: string;
  titulo: string;
  frase?: string | null;
  descripcion: string;
  tipo?: string | null;
  beneficios: BeneficioServicio[];
  proceso: PasoProcesoServicio[];
  orden: number;
}

export function getServiciosActivos() {
  return publicFetch<Servicio[]>("/api/servicios/activos");
}

export function getServicios(moduloId?: number | string) {
  const query = moduloId ? `?moduloId=${moduloId}` : "";
  return request<Servicio[]>(`/api/servicios${query}`);
}

export function crearServicio(data: ServicioInput) {
  return request<{ id: number }>("/api/servicios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function actualizarServicio(id: number | string, data: ServicioInput) {
  return request<void>(`/api/servicios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarActivoServicio(id: number | string, activo: boolean) {
  return request<void>(`/api/servicios/${id}/activo`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

export function eliminarServicio(id: number | string) {
  return request<void>(`/api/servicios/${id}`, { method: "DELETE" });
}

// ---- Promociones (Administrador) ----

export interface Promocion {
  id: number;
  texto: string;
  activo: boolean;
  servicioIds: number[];
}

export interface PromocionPublica {
  id: number;
  texto: string;
  servicioIds: number[];
}

export function promocionImagenUrl(id: number) {
  return `${API_URL}/api/promociones/${id}/imagen`;
}

export function getPromocionesActivasPublic() {
  return publicFetch<PromocionPublica[]>("/api/promociones/activas", 30);
}

export function getPromociones() {
  return request<Promocion[]>("/api/promociones");
}

export function crearPromocion(data: { texto: string; imagen: File; servicioIds: number[] }) {
  const formData = new FormData();
  formData.append("Texto", data.texto);
  formData.append("Imagen", data.imagen);
  data.servicioIds.forEach((id) => formData.append("Servicios", String(id)));
  return request<{ id: number }>("/api/promociones", {
    method: "POST",
    body: formData,
  });
}

export function actualizarPromocion(id: number | string, data: { texto: string; imagen?: File | null; servicioIds: number[] }) {
  const formData = new FormData();
  formData.append("Texto", data.texto);
  if (data.imagen) formData.append("Imagen", data.imagen);
  data.servicioIds.forEach((servicioId) => formData.append("Servicios", String(servicioId)));
  return request<void>(`/api/promociones/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export function cambiarActivoPromocion(id: number | string, activo: boolean) {
  return request<void>(`/api/promociones/${id}/activo`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

export function eliminarPromocion(id: number | string) {
  return request<void>(`/api/promociones/${id}`, { method: "DELETE" });
}
