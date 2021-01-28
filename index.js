import { open } from "sqlite";
import sqlite3 from "sqlite3";

import Repository from "./src/OrganizationsBundle/repository/index.js";
import SqlAdapter from "./src/OrganizationsBundle/sql-adapters/sqlite/index.js";
import app from "./src/app.js";

(async function () {
  const db = await open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });

  const adapter = await SqlAdapter(db);
  const repository = Repository(adapter);

  app({ repository });
})();
