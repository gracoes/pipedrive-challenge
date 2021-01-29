import { createTerminus } from "@godaddy/terminus";
import http from "http";

import app from "./src/app.js";
import InMemorySqliteClient from "./src/Infrastructure/in-memory-sqlite-client.js";
import Repository from "./src/OrganizationsBundle/repository/index.js";
import SqlAdapter from "./src/OrganizationsBundle/adapters/sqlite/index.js";

(async () => {
  const db = await InMemorySqliteClient.init();
  const adapter = await SqlAdapter.init(db);
  const repository = Repository(adapter);

  const server = http.createServer(app({ repository }));

  const onSignal = () => {
    console.log("\nServer starting cleanup...");

    return db.close();
  };

  const onShutdown = () => {
    console.log("\nShutdown complete!");
  };

  const terminusOptions = {
    signals: ["SIGINT"],
    onSignal,
    onShutdown,
  };

  createTerminus(server, terminusOptions);

  server.listen(8080, () => {
    console.log("Listening on http://localhost:8080");
  });
})();
