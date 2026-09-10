import { getCookie } from "./cookies";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type EstatusCaso = "Activo" | "Revision" | "Cerrado";
export type EstatusCita = "Pendiente" | "Confirmada" | "Cancelada";

export interface Caso {
  id: number;
  clienteNombre: string;
  tipo: string;
  estatus: EstatusCaso;
  fechaApertura: string;
  notas: string | null;
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
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export interface CasoDetalle extends Caso {
  tokenAcceso: string | null;
  tokenGeneradoEn: string | null;
  citas: Cita[];
  documentos: Documento[];
  checklist: ChecklistItem[];
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
}

export interface Cita {
  id: number;
  casoId: number | null;
  nombreCliente: string;
  telefono: string;
  fechaHora: string;
  estatus: EstatusCita;
}

export interface Documento {
  id: number;
  casoId: number;
  nombreArchivo: string;
  tipoContenido: string;
  tamanoBytes: number;
  fechaCarga: string;
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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getCookie("ec_token");
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

export function createCaso(data: {
  clienteNombre: string;
  tipo: string;
  notas?: string | null;
}) {
  return request<{ id: number }>("/api/casos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCaso(
  id: number | string,
  data: { clienteNombre: string; tipo: string; notas?: string | null }
) {
  return request<void>(`/api/casos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarEstatusCaso(id: number | string, estatus: EstatusCaso) {
  return request<void>(`/api/casos/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ estatus }),
  });
}

export function regenerarTokenCaso(id: number | string) {
  return request<{ token: string }>(`/api/casos/${id}/regenerar-token`, {
    method: "POST",
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

export function subirDocumento(casoId: number | string, file: File) {
  const formData = new FormData();
  formData.append("CasoId", String(casoId));
  formData.append("File", file);
  return request<{ id: number }>("/api/documentos", {
    method: "POST",
    body: formData,
  });
}

// ---- Contacto ----

export function enviarMensajeContacto(data: {
  nombre: string;
  telefono: string;
  email?: string | null;
  mensaje: string;
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

export function registrarPago(data: { casoId: number; concepto: string; monto: number }) {
  return request<{ id: number }>("/api/pagos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Usuarios (staff) ----

export function getUsuarios() {
  return request<Usuario[]>("/api/usuarios");
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

// ---- Auditoría (historial de cambios) ----

export function getAuditoriaPorCaso(casoId: number | string) {
  return request<AuditoriaEntry[]>(`/api/auditoria/caso/${casoId}`);
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
