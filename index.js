import { createTerminus } from "@godaddy/terminus";
import http from "http";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

import app from "./src/app.js";
import Repository from "./src/OrganizationsBundle/repository/index.js";
import SqlAdapter from "./src/OrganizationsBundle/adapters/sqlite/index.js";

(async () => {
  const db = await open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });

  const adapter = await SqlAdapter(db);
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
