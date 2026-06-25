const { app } = require("@azure/functions");
const { containers } = require("../shared/cosmos");

// GET /api/projects  — list all projects for the logged-in user's org
app.http("getProjects", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects",
  handler: async (req, context) => {
    const user = req.headers.get("x-ms-client-principal-name") || "unknown";
    const { resources } = await containers.projects.items
      .query({ query: "SELECT * FROM c ORDER BY c._ts DESC" })
      .fetchAll();
    return { jsonBody: resources };
  },
});

// POST /api/projects  — create a new project
app.http("createProject", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "projects",
  handler: async (req, context) => {
    const user = req.headers.get("x-ms-client-principal-name") || "unknown";
    const body = await req.json();
    const item = {
      id: `proj_${Date.now()}`,
      name: body.name,
      client: body.client,
      area: body.area || "Finanzas",
      createdBy: user,
      createdAt: new Date().toISOString(),
      status: "En curso",
    };
    const { resource } = await containers.projects.items.create(item);
    return { status: 201, jsonBody: resource };
  },
});

// DELETE /api/projects/{id}
app.http("deleteProject", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "projects/{id}",
  handler: async (req, context) => {
    const id = req.params.id;
    await containers.projects.item(id, id).delete();
    return { status: 204 };
  },
});
