const KEY = "eg-admin-auth";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}

export function isAdminAuthed(): boolean {
  return getAdminToken() !== null;
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, token);
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
