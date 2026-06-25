import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email.split("@")[0],
    email: user.email,
  };
}

async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

async function signOut() {
  await supabase.auth.signOut();
}

function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? {
      id: session.user.id,
      name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
      email: session.user.email,
    } : null);
  });
  return () => subscription.unsubscribe();
}

// ── Projects ──────────────────────────────────────────────────────────────────

async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function createProject({ name, client, area }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, client, area, created_by: user?.email, status: "En curso" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteProject(projectId) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

// ── Responses ─────────────────────────────────────────────────────────────────

async function getResponses(projectId) {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("project_id", projectId);
  if (error) throw error;
  const map = {};
  data.forEach((r) => { map[r.scenario_id] = r; });
  return map;
}

async function upsertResponse(projectId, scenarioId, { answer, note }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("responses")
    .upsert({
      project_id: projectId,
      scenario_id: scenarioId,
      answer,
      note: note || "",
      consultant: user?.email?.split("@")[0] || "?",
      updated_at: new Date().toISOString(),
    }, { onConflict: "project_id,scenario_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

async function getNotes(projectId, scenarioId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("project_id", projectId)
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function addNote(projectId, scenarioId, text) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      project_id: projectId,
      scenario_id: scenarioId,
      text,
      author: user?.email?.split("@")[0] || "?",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteNote(projectId, noteId) {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}

export default {
  getUser, signInWithEmail, signOut, onAuthChange,
  getProjects, createProject, deleteProject,
  getResponses, upsertResponse,
  getNotes, addNote, deleteNote,
};
