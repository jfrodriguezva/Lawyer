/**
 * Construye un enlace de WhatsApp ("click to chat") a partir de un teléfono
 * capturado en el sitio (normalmente a 10 dígitos, sin código de país) y un
 * mensaje prellenado. Gratis: no usa la API de negocio de WhatsApp, solo abre
 * una conversación normal — quien la responde es la propia abogada.
 */
export function buildWhatsAppLink(telefono: string, mensaje: string): string {
  const digitos = telefono.replace(/\D/g, "");
  const conCodigoPais = digitos.length === 10 ? `52${digitos}` : digitos;
  return `https://wa.me/${conCodigoPais}?text=${encodeURIComponent(mensaje)}`;
}
