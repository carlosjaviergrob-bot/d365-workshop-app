const BASE = process.env.REACT_APP_AZURE_API_BASE || "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth (Azure Static Web Apps built-in) ─────────────────────────────────────

async function getUser() {
  try {
    const res = await fetch("/.auth/me");
    const data = await res.json();
    const p = data?.clientPrincipal;
    if (!p) return null;
    return { id: p.userId, name: p.userDetails.split("@")[0], email: p.userDetails };
  } catch {
    return null;
  }
}

async function signInWithEmail() {
  window.location.href = "/.auth/login/aad";
}

async function signOut() {
  window.location.href = "/.auth/logout";
}

function onAuthChange(callback) {
  getUser().then(callback);
  return () => {};
}

// ── Projects ──────────────────────────────────────────────────────────────────

async function getProjects() {
  return apiFetch("/projects");
}

async function createProject({ name, client, area }) {
  return apiFetch("/projects", {
    method: "POST",
    body: JSON.stringify({ name, client, area }),
  });
}

async function deleteProject(projectId) {
  return apiFetch(`/projects/${projectId}`, { method: "DELETE" });
}

// ── Responses ─────────────────────────────────────────────────────────────────

async function getResponses(projectId) {
  return apiFetch(`/projects/${projectId}/responses`);
}

async function upsertResponse(projectId, scenarioId, { answer, note }) {
  return apiFetch(`/projects/${projectId}/responses/${scenarioId}`, {
    method: "PUT",
    body: JSON.stringify({ answer, note }),
  });
}

// ── Notes ─────────────────────────────────────────────────────────────────────

async function getNotes(projectId, scenarioId) {
  return apiFetch(`/projects/${projectId}/notes/${scenarioId}`);
}

async function addNote(projectId, scenarioId, text) {
  return apiFetch(`/projects/${projectId}/notes/${scenarioId}`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

async function deleteNote(projectId, noteId) {
  return apiFetch(`/projects/${projectId}/notes/${noteId}`, { method: "DELETE" });
}

export default {
  getUser, signInWithEmail, signOut, onAuthChange,
  getProjects, createProject, deleteProject,
  getResponses, upsertResponse,
  getNotes, addNote, deleteNote,
};
