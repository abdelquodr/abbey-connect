const DEFAULT_BACKEND_BASE_URL = "http://localhost:3000";
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;

export const BACKEND_BASE_URL = DEFAULT_BACKEND_BASE_URL;

export const backendUrl = (path: string) => {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${BACKEND_BASE_URL}/${normalizedPath}`;
};

type BackendRequestOptions = RequestInit & {
  timeoutMs?: number;
};

export class BackendApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.details = details;
  }
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") ?? "";
  let data: unknown;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : ((data as { message?: string; error?: string }).message ??
          (data as { message?: string; error?: string }).error ??
          "Request failed");

    throw new BackendApiError(message, response.status, data);
  }

  return data as T;
};

export const backendRequest = async <T>(
  path: string,
  init: BackendRequestOptions = {},
): Promise<T> => {
  const timeoutMs = Number.isFinite(init.timeoutMs)
    ? Math.max(1000, Number(init.timeoutMs))
    : DEFAULT_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);
  const externalSignal = init.signal;
  const abortFromExternal = () => controller.abort();

  const requestInit: RequestInit = { ...init };
  if ("timeoutMs" in requestInit) {
    delete (requestInit as BackendRequestOptions).timeoutMs;
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", abortFromExternal, {
        once: true,
      });
    }
  }

  try {
    const response = await fetch(backendUrl(path), {
      ...requestInit,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(requestInit.headers ?? {}),
      },
    });

    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof BackendApiError) {
      throw error;
    }

    const errorName =
      typeof error === "object" && error !== null && "name" in error
        ? String((error as { name?: unknown }).name)
        : "";

    if (errorName === "AbortError") {
      if (externalSignal?.aborted) {
        throw new BackendApiError("Request was cancelled", 499, error);
      }

      if (didTimeout) {
        throw new BackendApiError(
          "Request timed out. Please try again.",
          408,
          error,
        );
      }

      throw new BackendApiError("Request was cancelled", 0, error);
    }

    if (error instanceof TypeError) {
      throw new BackendApiError(
        "Network error. Please check your internet connection and try again.",
        0,
        error,
      );
    }

    throw new BackendApiError("Unexpected error. Please try again.", 0, error);
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", abortFromExternal);
    }
  }
};

export const backendFetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { credentials: "include" });
  return parseResponse<T>(response);
};
