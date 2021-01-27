import express from "express";

import createHandler from "./OrganizationsBundle/handlers/create/index.js";
import getHandler from "./OrganizationsBundle/handlers/get/index.js";

export default function ({ repository }) {
  const server = express();

  server.use(express.json());

  server.get("/ping", (_, res) => res.json({ message: "Hello World" }, 200));
  server.post("/organization/relations", createHandler(repository));
  server.get("/organization/:name/relations", getHandler(repository));

  server.listen(8080, () => {
    console.log("Listening on port 8080");
  });
}
