const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

const ACCESS_KEY = "sundara_access_token";
const REFRESH_KEY = "sundara_refresh_token";

export interface ApiError {
  code: string;
  message: string;
}

async function rawFetch(path: string, init?: RequestInit): Promise<{ res: Response; body: unknown }> {
  const token = localStorage.getItem(ACCESS_KEY);
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => null);
  return { res, body };
}

/** Single-flight refresh so parallel 401s share one rotation. */
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) return false;
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || body?.success === false) return false;
      localStorage.setItem(ACCESS_KEY, body.data.access_token);
      if (body.data.refresh_token) {
        localStorage.setItem(REFRESH_KEY, body.data.refresh_token);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function toError(res: Response, body: unknown): ApiError {
  const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
  return {
    code: err?.code ?? `HTTP_${res.status}`,
    message: err?.message ?? "We couldn't connect right now. Please try again.",
  };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isAuthCall = path.startsWith("/auth/");
  let { res, body } = await rawFetch(path, init);

  // Access token expired mid-session → rotate once, then retry the original call.
  if (res.status === 401 && !isAuthCall && (await tryRefresh())) {
    ({ res, body } = await rawFetch(path, init));
  }

  if (!res.ok || (body as { success?: boolean } | null)?.success === false) {
    throw toError(res, body);
  }
  const data = (body as { data?: T } | null)?.data;
  if (data === undefined) {
    throw toError(res, body);
  }
  return data;
}
