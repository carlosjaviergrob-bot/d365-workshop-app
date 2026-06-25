/**
 * Backend interface — ambos adaptadores implementan estos métodos.
 * El frontend importa SOLO desde este archivo, nunca desde azure.js o supabase.js directamente.
 *
 * Métodos disponibles:
 *   getUser()                                    → { id, name, email }
 *   signOut()
 *   getProjects()                                → Project[]
 *   createProject({ name, client, area })        → Project
 *   deleteProject(projectId)
 *   getResponses(projectId)                      → { [scenarioId]: Response }
 *   upsertResponse(projectId, scenarioId, { answer, note }) → Response
 *   getNotes(projectId, scenarioId)              → Note[]
 *   addNote(projectId, scenarioId, text)         → Note
 *   deleteNote(projectId, noteId)
 */

const BACKEND = process.env.REACT_APP_BACKEND || "supabase";

let adapter;

if (BACKEND === "azure") {
  adapter = require("./azure").default;
} else {
  adapter = require("./supabase").default;
}

export default adapter;
export const backendName = BACKEND;
