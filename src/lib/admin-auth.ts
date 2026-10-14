const KEY = "eg-admin-auth";
const PASSWORD = import.meta.env["VITE_ADMIN_PASSWORD"] ?? "estrela123";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(KEY) === "1";
}

export function loginAdmin(password: string): boolean {
  if (password === PASSWORD) {
    window.sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(KEY);
}
