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

// ---- Casos ----

export function getCasos() {
  return request<Caso[]>("/api/casos");
}

export function getCaso(id: number | string) {
  return request<Caso>(`/api/casos/${id}`);
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

export function marcarMensajeAtendido(id: number | string) {
  return request<void>(`/api/contacto/${id}/atendido`, {
    method: "PATCH",
  });
}
