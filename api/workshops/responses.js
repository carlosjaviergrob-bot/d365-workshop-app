const { app } = require("@azure/functions");
const { containers } = require("../shared/cosmos");

// GET /api/projects/{projectId}/responses
app.http("getResponses", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{projectId}/responses",
  handler: async (req, context) => {
    const { projectId } = req.params;
    const { resources } = await containers.responses.items
      .query({
        query: "SELECT * FROM c WHERE c.projectId = @pid",
        parameters: [{ name: "@pid", value: projectId }],
      })
      .fetchAll();
    // Return as a map { scenarioId: responseObject }
    const map = {};
    resources.forEach((r) => { map[r.scenarioId] = r; });
    return { jsonBody: map };
  },
});

// PUT /api/projects/{projectId}/responses/{scenarioId}
app.http("upsertResponse", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "projects/{projectId}/responses/{scenarioId}",
  handler: async (req, context) => {
    const user = req.headers.get("x-ms-client-principal-name") || "unknown";
    const { projectId, scenarioId } = req.params;
    const body = await req.json();
    const item = {
      id: `${projectId}_${scenarioId}`,
      projectId,
      scenarioId,
      answer: body.answer,       // "si" | "no" | "dif"
      note: body.note || "",
      consultant: user,
      updatedAt: new Date().toISOString(),
    };
    const { resource } = await containers.responses.items.upsert(item);
    return { jsonBody: resource };
  },
});
