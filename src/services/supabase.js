import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Enrich with consultant profile (role, name)
  const { data: profile } = await supabase
    .from("consultants")
    .select("full_name, role, active")
    .eq("email", user.email)
    .single();
  return {
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.email.split("@")[0],
    role: profile?.role || "consultant",
    active: profile?.active ?? true,
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
  // Initial load
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) { callback(null); return; }
    const u = await getUser();
    callback(u);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) { callback(null); return; }
    const u = await getUser();
    callback(u);
  });
  return () => subscription.unsubscribe();
}

// ── Consultants (maestro) ─────────────────────────────────────────────────────

async function getConsultants() {
  const { data, error } = await supabase
    .from("consultants")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return data;
}

async function createConsultant({ email, full_name, role }) {
  const { data, error } = await supabase
    .from("consultants")
    .insert({ email, full_name, role: role || "consultant", active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateConsultant(id, fields) {
  const { data, error } = await supabase
    .from("consultants")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteConsultant(id) {
  const { error } = await supabase
    .from("consultants")
    .update({ active: false })
    .eq("id", id);
  if (error) throw error;
}

// ── Projects ──────────────────────────────────────────────────────────────────

async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_members(consultant_id, area, consultants(full_name, email, role))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function createProject({ name, client, area }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, client, area, created_by: user?.email, owner_email: user?.email, status: "En curso" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteProject(projectId) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

// ── Project Members ───────────────────────────────────────────────────────────

async function getProjectMembers(projectId) {
  const { data, error } = await supabase
    .from("project_members")
    .select("*, consultants(id, full_name, email, role)")
    .eq("project_id", projectId);
  if (error) throw error;
  return data;
}

async function addProjectMember(projectId, consultantId, area) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, consultant_id: consultantId, area: area || null, added_by: user?.email })
    .select("*, consultants(id, full_name, email, role)")
    .single();
  if (error) throw error;
  return data;
}

async function removeProjectMember(projectId, consultantId) {
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("consultant_id", consultantId);
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
    .insert({ project_id: projectId, scenario_id: scenarioId, text, author: user?.email?.split("@")[0] || "?" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteNote(projectId, noteId) {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}


// ── Scenario Catalog ──────────────────────────────────────────────────────────

async function getCatalogScenarios() {
  const { data, error } = await supabase
    .from("scenario_selection")
    .select("*")
    .order("area")
    .order("scenario_id");
  if (error) throw error;
  return data;
}

async function toggleCatalogScenario(scenarioId, active) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("scenario_selection")
    .update({ active, updated_by: user?.email, updated_at: new Date().toISOString() })
    .eq("scenario_id", scenarioId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getActiveScenarioIds() {
  const { data, error } = await supabase
    .from("scenario_selection")
    .select("scenario_id, area, title, module, menu, description, fit")
    .eq("active", true);
  if (error) throw error;
  return data;
}

export default {
  getUser, signInWithEmail, signOut, onAuthChange,
  getCatalogScenarios, toggleCatalogScenario, getActiveScenarioIds,
  getConsultants, createConsultant, updateConsultant, deleteConsultant,
  getProjects, createProject, deleteProject,
  getProjectMembers, addProjectMember, removeProjectMember,
  getResponses, upsertResponse,
  getNotes, addNote, deleteNote,
};
