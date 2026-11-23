import api from "./axios.js";

export async function getCurrentUser() {
  return (await api.get("/users")).data;
}

export async function updateProfile(payload) {
  return (await api.patch("/users", payload)).data;
}

export async function changePassword(payload) {
  return (await api.patch("/users/change-password", payload)).data;
}

export async function deleteAccount() {
  return (await api.delete("/users/me")).data;
}

export async function getUsers(params) {
  return (await api.get("/users/admin", { params })).data;
}

export async function getUserById(id, params) {
  return (await api.get(`/users/admin/${id}`, { params })).data;
}

export async function deleteUser(id) {
  return (await api.delete(`/users/admin/${id}`)).data;
}

export async function toggleUserRole(id) {
  return (await api.patch(`/users/admin/${id}/toggle-role`)).data;
}

export async function getAdminStats() {
  return (await api.get("/users/admin/stats")).data;
}
