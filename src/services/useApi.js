import { useState, useEffect, useCallback } from "react";
import backend from "./backend";

// ── Auth ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsub = backend.onAuthChange(setUser);
    return unsub;
  }, []);
  return { user, loading: user === undefined, signIn: backend.signInWithEmail, signOut: backend.signOut };
}

// ── Consultants ───────────────────────────────────────────────────────────────

export function useConsultants() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setConsultants(await backend.getConsultants()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (fields) => {
    const c = await backend.createConsultant(fields);
    setConsultants(prev => [...prev, c].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    return c;
  };

  const update = async (id, fields) => {
    const c = await backend.updateConsultant(id, fields);
    setConsultants(prev => prev.map(x => x.id === id ? c : x));
    return c;
  };

  const remove = async (id) => {
    await backend.deleteConsultant(id);
    setConsultants(prev => prev.map(x => x.id === id ? { ...x, active: false } : x));
  };

  return { consultants, loading, create, update, remove, reload: load };
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProjects(await backend.getProjects()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createProject = async (fields) => {
    const p = await backend.createProject(fields);
    setProjects(prev => [p, ...prev]);
    return p;
  };

  const deleteProject = async (id) => {
    await backend.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return { projects, loading, createProject, deleteProject, reload: load };
}

// ── Project Members ───────────────────────────────────────────────────────────

export function useProjectMembers(projectId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    backend.getProjectMembers(projectId)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const add = async (consultantId, area) => {
    const m = await backend.addProjectMember(projectId, consultantId, area);
    setMembers(prev => [...prev, m]);
    return m;
  };

  const remove = async (consultantId) => {
    await backend.removeProjectMember(projectId, consultantId);
    setMembers(prev => prev.filter(m => m.consultant_id !== consultantId));
  };

  return { members, loading, add, remove };
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
      setResponses(prev => ({ ...prev, [scenarioId]: updated }));
    } finally { setSaving(false); }
  }, [projectId]);

  return { responses, saving, upsert };
}

// ── Active Scenarios from catalog ────────────────────────────────────────────

export function useActiveScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getActiveScenarioIds()
      .then(data => {
        // Map DB fields to the format expected by ScenarioCard
        // DB: scenario_id, area, title, forms, biz_question, key_points, tip, bpc_process, bpc_e2e, menu, fit
        // Card: id, area, t, forms (array), biz, key, tip, bpc_process, bpc_e2e, menu, fit
        const mapped = data.map(s => ({
          id: s.scenario_id,
          area: s.area,
          t: s.title,
          forms: s.forms ? s.forms.split(' | ') : [],
          biz: s.biz_question || '',
          key: s.key_points || '',
          tip: s.tip || '',
          menu: s.menu || '',
          fit: s.fit || 'fit',
          bpc_process: s.bpc_process || '',
          bpc_e2e: s.bpc_e2e || '',
        }));
        setScenarios(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { scenarios, loading };
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
    setNotes(prev => [...prev, n]);
  };

  const deleteNote = async (noteId) => {
    await backend.deleteNote(projectId, noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  return { notes, addNote, deleteNote };
}
