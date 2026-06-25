const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database("d365workshops");
const containers = {
  projects:  database.container("projects"),
  responses: database.container("responses"),
  notes:     database.container("notes"),
};

module.exports = { containers };
