export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthMode = "public" | "user" | "admin" | "auto";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

function getAuthToken(mode: AuthMode): string | null {
  if (mode === "public") return null;
  if (mode === "user") return getToken();
  if (mode === "admin") return getAdminToken();
  return getToken() ?? getAdminToken();
}

async function apiWithAuth(
  path: string,
  mode: AuthMode,
  options: RequestInit = {},
) {
  const token = getAuthToken(mode);
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function api(path: string, options: RequestInit = {}) {
  return apiWithAuth(path, "auto", options);
}

export async function apiPublic(path: string, options: RequestInit = {}) {
  return apiWithAuth(path, "public", options);
}

export async function apiUser(path: string, options: RequestInit = {}) {
  return apiWithAuth(path, "user", options);
}

export async function apiAdmin(path: string, options: RequestInit = {}) {
  return apiWithAuth(path, "admin", options);
}

export async function apiGet(path: string) {
  return api(path, { method: "GET" });
}

export async function apiPost(path: string, body: unknown) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetPublic(path: string) {
  return apiPublic(path, { method: "GET" });
}

export async function apiPostPublic(path: string, body: unknown) {
  return apiPublic(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetUser(path: string) {
  return apiUser(path, { method: "GET" });
}

export async function apiPostUser(path: string, body: unknown) {
  return apiUser(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetAdmin(path: string) {
  return apiAdmin(path, { method: "GET" });
}

export async function apiPostAdmin(path: string, body: unknown) {
  return apiAdmin(path, { method: "POST", body: JSON.stringify(body) });
}
