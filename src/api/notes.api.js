import api from "./axios.js";

export async function getNotes(params = {}) {
  return (await api.get("/notes", { params })).data;
}

export async function getNote(id) {
  return (await api.get(`/notes/${id}`)).data;
}

export async function createNote(payload) {
  return (await api.post("/notes", payload)).data;
}

export async function updateNote(id, payload) {
  return (await api.patch(`/notes/${id}`, payload)).data;
}

export async function trashNote(id) {
  return (await api.delete(`/notes/${id}`)).data;
}

export async function permanentlyDeleteNote(id) {
  return (await api.delete(`/notes/${id}/permanent`)).data;
}

export async function pinNote(id) {
  return (await api.patch(`/notes/${id}/pin`)).data;
}

export async function unpinNote(id) {
  return (await api.patch(`/notes/${id}/unpin`)).data;
}

export async function archiveNote(id) {
  return (await api.patch(`/notes/${id}/archive`)).data;
}

export async function restoreArchivedNote(id) {
  return (await api.patch(`/notes/${id}/restore`)).data;
}

export async function restoreDeletedNote(id) {
  return (await api.patch(`/notes/${id}/restore-trash`)).data;
}

export async function getNotesStats() {
  return (await api.get("/notes/stats")).data;
}
