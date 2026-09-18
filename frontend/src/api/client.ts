const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface ApiError {
  code: string;
  message: string;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("sundara_access_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    const err: ApiError = {
      code: body?.error?.code ?? `HTTP_${res.status}`,
      message: body?.error?.message ?? "We couldn't connect right now. Please try again.",
    };
    throw err;
  }
  return body.data as T;
}
