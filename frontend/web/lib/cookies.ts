// Tiny cookie helpers — no external cookie library needed for this MVP.
// All functions are safe to call from client components only.

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}
