import axios from "axios";

const apiOrigin = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const apiBaseURL = `${apiOrigin}/api/v1`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

let accessToken = null;
let refreshRequest = null;
let refreshCallCount = 0;

function createAuthDiagnosticId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDiagnosticEndpoint(config) {
  return String(config?.url || "unknown").split("?")[0];
}

function logAuthDiagnostic(event, details) {
  console.info(`[AUTH_DIAG] ${event}`, details);
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

function getRefreshedAccessToken() {
  if (!refreshRequest) {
    const diagnosticId = createAuthDiagnosticId();
    refreshCallCount = 1;
    const request = refreshClient
      .post("/auth/refresh-token", undefined, {
        headers: { "X-Auth-Diag-Id": diagnosticId },
      })
      .then((response) => {
        const token = response.data?.data?.accessToken;
        const validAccessToken = typeof token === "string" && token.length > 0;
        logAuthDiagnostic("REFRESH_RESPONSE", {
          diagnosticId,
          statusCode: response.status,
          validAccessToken,
        });
        if (!validAccessToken) {
          throw new Error("The refresh response did not include an access token.");
        }
        try {
          setAccessToken(token);
          logAuthDiagnostic("REFRESH_ACCESS_TOKEN_STORED", {
            diagnosticId,
            stored: true,
          });
        } catch (error) {
          logAuthDiagnostic("REFRESH_ACCESS_TOKEN_STORED", {
            diagnosticId,
            stored: false,
          });
          throw error;
        }
        return token;
      })
      .catch((error) => {
        logAuthDiagnostic("REFRESH_FAILED", {
          diagnosticId,
          statusCode: error?.response?.status || null,
        });
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
        refreshCallCount = 0;
      });
    request.authDiagId = diagnosticId;
    refreshRequest = request;
  } else {
    refreshCallCount += 1;
    logAuthDiagnostic("REFRESH_COALESCED", {
      diagnosticId: refreshRequest.authDiagId,
      simultaneousCallCount: refreshCallCount,
    });
  }
  return refreshRequest;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (config._authDiagRetry) {
    const authorization = config.headers?.Authorization
      || config.headers?.get?.("Authorization");
    logAuthDiagnostic("RETRY_REQUEST_SENT", {
      diagnosticId: config._authDiagId,
      method: (config.method || "get").toUpperCase(),
      endpoint: getDiagnosticEndpoint(config),
      usesUpdatedAccessToken: Boolean(
        accessToken && authorization === `Bearer ${accessToken}`
      ),
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config?._authDiagRetry) {
      logAuthDiagnostic("RETRY_REQUEST_RESULT", {
        diagnosticId: response.config._authDiagId,
        method: (response.config.method || "get").toUpperCase(),
        endpoint: getDiagnosticEndpoint(response.config),
        statusCode: response.status,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.startsWith("/auth/");

    if (originalRequest?._authDiagRetry) {
      logAuthDiagnostic("RETRY_REQUEST_RESULT", {
        diagnosticId: originalRequest._authDiagId,
        method: (originalRequest.method || "get").toUpperCase(),
        endpoint: getDiagnosticEndpoint(originalRequest),
        statusCode: error.response?.status || null,
      });
    }

    if (error.response?.status !== 401 || !originalRequest || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      logAuthDiagnostic("RETRY_BRANCH_TRIGGERED", {
        diagnosticId: originalRequest._authDiagId || null,
        method: (originalRequest.method || "get").toUpperCase(),
        endpoint: getDiagnosticEndpoint(originalRequest),
        statusCode: error.response.status,
      });
      if (error.response?.status === 401) {
        clearAccessToken();
        logAuthDiagnostic("SESSION_EXPIRED_DISPATCHED", {
          diagnosticId: originalRequest._authDiagId || null,
          reason: "retried_request_401",
        });
        window.dispatchEvent(new CustomEvent("notely:session-expired"));
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    let diagnosticId = null;
    try {
      const pendingRefresh = getRefreshedAccessToken();
      diagnosticId = pendingRefresh.authDiagId;
      const token = await pendingRefresh;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      originalRequest._authDiagId = diagnosticId;
      originalRequest._authDiagRetry = true;
      originalRequest.headers["X-Auth-Diag-Id"] = diagnosticId;
      logAuthDiagnostic("RETRY_REQUEST_PREPARED", {
        diagnosticId,
        method: (originalRequest.method || "get").toUpperCase(),
        endpoint: getDiagnosticEndpoint(originalRequest),
        usesUpdatedAccessToken: originalRequest.headers.Authorization === `Bearer ${accessToken}`,
      });
      return api(originalRequest);
    } catch (refreshError) {
      if (refreshError?.response?.status === 401) {
        clearAccessToken();
        logAuthDiagnostic("SESSION_EXPIRED_DISPATCHED", {
          diagnosticId,
          reason: "refresh_401",
        });
        window.dispatchEvent(new CustomEvent("notely:session-expired"));
      }
      return Promise.reject(refreshError);
    }
  },
);

export async function refreshAccessToken() {
  return getRefreshedAccessToken();
}

export default api;
