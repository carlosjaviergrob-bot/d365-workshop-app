const { app } = require("@azure/functions");
const { containers } = require("../shared/cosmos");

// GET /api/projects/{projectId}/notes/{scenarioId}
app.http("getNotes", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{projectId}/notes/{scenarioId}",
  handler: async (req, context) => {
    const { projectId, scenarioId } = req.params;
    const { resources } = await containers.notes.items
      .query({
        query: "SELECT * FROM c WHERE c.projectId = @pid AND c.scenarioId = @sid ORDER BY c._ts ASC",
        parameters: [
          { name: "@pid", value: projectId },
          { name: "@sid", value: scenarioId },
        ],
      })
      .fetchAll();
    return { jsonBody: resources };
  },
});

// POST /api/projects/{projectId}/notes/{scenarioId}
app.http("addNote", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "projects/{projectId}/notes/{scenarioId}",
  handler: async (req, context) => {
    const user = req.headers.get("x-ms-client-principal-name") || "unknown";
    const { projectId, scenarioId } = req.params;
    const body = await req.json();
    const item = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      projectId,
      scenarioId,
      text: body.text,
      author: user,
      createdAt: new Date().toISOString(),
    };
    const { resource } = await containers.notes.items.create(item);
    return { status: 201, jsonBody: resource };
  },
});

// DELETE /api/projects/{projectId}/notes/{noteId}
app.http("deleteNote", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "projects/{projectId}/notes/{noteId}",
  handler: async (req, context) => {
    const { projectId, noteId } = req.params;
    await containers.notes.item(noteId, projectId).delete();
    return { status: 204 };
  },
});
