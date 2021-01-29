import { open } from "sqlite";
import sqlite3 from "sqlite3";

import app from "./src/app.js";
import Repository from "./src/OrganizationsBundle/repository/index.js";
import SqlAdapter from "./src/OrganizationsBundle/adapters/sqlite/index.js";

(async function () {
  const db = await open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });

  const adapter = await SqlAdapter(db);
  const repository = Repository(adapter);

  const server = app({ repository });

  server.listen(8080, () => {
    console.log("Listening on localhost:8080");
  });
})();
