import express from "express";

import createHandler from "./OrganizationsBundle/handlers/create/index.js";
import getHandler from "./OrganizationsBundle/handlers/get/index.js";

export default function ({ repository }) {
  const server = express();

  server.use(express.json());

  server.get("/ping", (_, res) =>
    res.status(200).json({ message: "Hello World!" })
  );
  server.post("/organization/relations", createHandler(repository));
  server.get("/organization/:name/relations", getHandler(repository));

  return server;
}
