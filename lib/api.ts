/**
 * API client for Continuum backend.
 * Sends Bearer token when provided for authenticated requests.
 */

/** Dispatches event to trigger logout when backend returns 401 */
export function dispatchUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("continuum:unauthorized"));
  }
}

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      dispatchUnauthorized();
    }
    const err = await res.json().catch(() => ({}));
    throw new ApiError(
      (err as { message?: string })?.message || `HTTP ${res.status}`,
      res.status,
      err
    );
  }

  return res.json() as Promise<T>;
}
