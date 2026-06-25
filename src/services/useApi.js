import { useState, useEffect, useCallback, useRef } from "react";
import backend from "./backend";

// ── Auth ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    const unsub = backend.onAuthChange(setUser);
    return unsub;
  }, []);

  return {
    user,
    loading: user === undefined,
    signIn: backend.signInWithEmail,
    signOut: backend.signOut,
  };
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await backend.getProjects());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createProject = async (fields) => {
    const p = await backend.createProject(fields);
    setProjects((prev) => [p, ...prev]);
    return p;
  };

  const deleteProject = async (id) => {
    await backend.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, loading, createProject, deleteProject };
}

// ── Responses ─────────────────────────────────────────────────────────────────

export function useResponses(projectId) {
  const [responses, setResponses] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    backend.getResponses(projectId).then(setResponses).catch(console.error);
  }, [projectId]);

  const upsert = useCallback(async (scenarioId, answer, note) => {
    setSaving(true);
    try {
      const updated = await backend.upsertResponse(projectId, scenarioId, { answer, note });
      setResponses((prev) => ({ ...prev, [scenarioId]: updated }));
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  return { responses, saving, upsert };
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function useNotes(projectId, scenarioId) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!projectId || !scenarioId) return;
    backend.getNotes(projectId, scenarioId).then(setNotes).catch(console.error);
  }, [projectId, scenarioId]);

  const addNote = async (text) => {
    const n = await backend.addNote(projectId, scenarioId, text);
    setNotes((prev) => [...prev, n]);
  };

  const deleteNote = async (noteId) => {
    await backend.deleteNote(projectId, noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return { notes, addNote, deleteNote };
}
