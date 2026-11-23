import api, { clearAccessToken, refreshAccessToken, setAccessToken } from "./axios.js";

export async function register(payload) {
  return (await api.post("/auth/register", payload)).data;
}

export async function login(payload) {
  const response = (await api.post("/auth/login", payload)).data;
  const token = response?.data?.accessToken;
  if (!token) throw new Error("The login response did not include an access token.");
  setAccessToken(token);
  return response;
}

export { refreshAccessToken };

export async function logout() {
  try {
    return (await api.post("/auth/logout")).data;
  } finally {
    clearAccessToken();
  }
}
