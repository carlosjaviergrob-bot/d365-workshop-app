import { useState, useEffect, useCallback } from "react";

const BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  if (res.status === 204) return null;
  return res.json();
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/projects");
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createProject = async (name, client, area) => {
    const p = await apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify({ name, client, area }),
    });
    setProjects((prev) => [p, ...prev]);
    return p;
  };

  const deleteProject = async (id) => {
    await apiFetch(`/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, loading, createProject, deleteProject, reload: load };
}

// ── Responses ─────────────────────────────────────────────────────────────────

export function useResponses(projectId) {
  const [responses, setResponses] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    apiFetch(`/projects/${projectId}/responses`).then(setResponses).catch(console.error);
  }, [projectId]);

  const upsert = useCallback(
    async (scenarioId, answer, note) => {
      setSaving(true);
      try {
        const updated = await apiFetch(
          `/projects/${projectId}/responses/${scenarioId}`,
          { method: "PUT", body: JSON.stringify({ answer, note }) }
        );
        setResponses((prev) => ({ ...prev, [scenarioId]: updated }));
      } finally {
        setSaving(false);
      }
    },
    [projectId]
  );

  return { responses, saving, upsert };
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function useNotes(projectId, scenarioId) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!projectId || !scenarioId) return;
    apiFetch(`/projects/${projectId}/notes/${scenarioId}`).then(setNotes).catch(console.error);
  }, [projectId, scenarioId]);

  const addNote = async (text) => {
    const note = await apiFetch(`/projects/${projectId}/notes/${scenarioId}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    setNotes((prev) => [...prev, note]);
  };

  const deleteNote = async (noteId) => {
    await apiFetch(`/projects/${projectId}/notes/${noteId}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return { notes, addNote, deleteNote };
}

// ── Current user (from Azure Static Web Apps auth) ────────────────────────────

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/.auth/me")
      .then((r) => r.json())
      .then((data) => {
        const principal = data?.clientPrincipal;
        if (principal) setUser({ name: principal.userDetails, id: principal.userId });
      })
      .catch(() => setUser({ name: "Consultor", id: "local" }));
  }, []);

  return user;
}
