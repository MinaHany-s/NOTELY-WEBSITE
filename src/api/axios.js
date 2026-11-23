import axios from "axios";

const apiBaseURL = `${(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")}/api/v1`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let accessToken = null;
let refreshRequest = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

function getRefreshedAccessToken() {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post("/auth/refresh-token")
      .then((response) => {
        const token = response.data?.data?.accessToken;
        if (!token) throw new Error("The refresh response did not include an access token.");
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.startsWith("/auth/");

    if (error.response?.status !== 401 || !originalRequest || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("notely:session-expired"));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await getRefreshedAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("notely:session-expired"));
      return Promise.reject(refreshError);
    }
  },
);

export async function refreshAccessToken() {
  return getRefreshedAccessToken();
}

export default api;
