export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken() ?? getAdminToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
}

export async function apiGet(path: string) {
  return api(path, { method: "GET" });
}

export async function apiPost(path: string, body: unknown) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}
