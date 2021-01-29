import supertest from "supertest";

import Adapter from "./OrganizationsBundle/adapters/sqlite/index.js";
import app from "./app.js";
import fixtures from "./Tests/fixtures/names.js";
import InMemorySqliteClient from "./Infrastructure/in-memory-sqlite-client.js";
import Repository from "./OrganizationsBundle/repository/index.js";

describe("Functional tests", () => {
  let db;
  let repository;
  beforeAll(async () => {
    db = await InMemorySqliteClient.init();
    const adapter = await Adapter.init(db);
    repository = Repository(adapter);
  });

  afterAll(async () => {
    await db.exec("DELETE FROM relations");
    await db.close();
  });

  describe("GET /ping", () => {
    test("it responds", async () => {
      const server = app({ repository });

      await supertest(server)
        .get("/ping")
        .expect(200, { message: "Hello World!" });
    });
  });

  describe("POST /organization/relations", () => {
    beforeEach(async () => {
      await db.exec("DELETE FROM relations");
    });

    test("it creates", async () => {
      const server = app({ repository });
      const body = {
        org_name: "Paradise Island",
        daughters: [
          {
            org_name: "Banana tree",
            daughters: [
              {
                org_name: "Yellow Banana",
              },
              {
                org_name: "Brown Banana",
              },
              {
                org_name: "Black Banana",
              },
            ],
          },
          {
            org_name: "Big banana tree",
            daughters: [
              {
                org_name: "Yellow Banana",
              },
              {
                org_name: "Brown Banana",
              },
              {
                org_name: "Green Banana",
              },
              {
                org_name: "Black Banana",
                daughters: [
                  {
                    org_name: "Phoneutria Spider",
                  },
                ],
              },
            ],
          },
        ],
      };

      await supertest(server)
        .post("/organization/relations")
        .set("Content-Type", "application/json")
        .send(body)
        .expect(201, { success: true });
    });

    test("it returns 400 BAD REQUEST when 'org_name' is empty", async () => {
      const server = app({ repository });
      const body = {
        org_name: "",
        daughters: [
          {
            org_name: "Banana tree",
          },
        ],
      };

      await supertest(server)
        .post("/organization/relations")
        .set("Content-Type", "application/json")
        .send(body)
        .expect(400, { error: "Property 'org_name' must be present" });
    });

    test("it returns 400 BAD REQUEST when 'org_name' does not exist", async () => {
      const server = app({ repository });
      const body = {
        daughters: [
          {
            org_name: "Banana tree",
          },
        ],
      };

      await supertest(server)
        .post("/organization/relations")
        .set("Content-Type", "application/json")
        .send(body)
        .expect(400, { error: "Property 'org_name' must be present" });
    });

    test("it returns 400 BAD REQUEST when 'daughters' is empty", async () => {
      const server = app({ repository });
      const body = {
        org_name: "Paradise Island",
        daughters: [],
      };

      await supertest(server)
        .post("/organization/relations")
        .set("Content-Type", "application/json")
        .send(body)
        .expect(400, {
          error: "Organization 'Paradise Island' must have daughters",
        });
    });

    test("it returns 400 BAD REQUEST when 'daughters' does not exist", async () => {
      const server = app({ repository });
      const body = {
        org_name: "Paradise Island",
      };

      await supertest(server)
        .post("/organization/relations")
        .set("Content-Type", "application/json")
        .send(body)
        .expect(400, {
          error: "Organization 'Paradise Island' must have daughters",
        });
    });
  });

  describe("GET /organization/:name/relations", () => {
    beforeAll(async () => {
      const names = fixtures.names.map((name) => ({
        head: "Parent",
        tail: `${name}`,
        type: "parent",
      }));

      const relations = [
        { head: "Banana tree 2", tail: "Paradise Island 2", type: "parent" },
        {
          head: "Big banana tree 2",
          tail: "Paradise Island 2",
          type: "parent",
        },
        { head: "Paradise Island 2", tail: "Banana tree 2", type: "daughter" },
        {
          head: "Paradise Island 2",
          tail: "Big banana tree 2",
          type: "daughter",
        },
        { head: "Banana tree 2", tail: "Big banana tree 2", type: "sister" },
        { head: "Big banana tree 2", tail: "Banana tree 2", type: "sister" },
        { head: "Yellow Banana 2", tail: "Banana tree 2", type: "parent" },
        { head: "Brown Banana 2", tail: "Banana tree 2", type: "parent" },
        { head: "Black Banana 2", tail: "Banana tree 2", type: "parent" },
        { head: "Banana tree 2", tail: "Yellow Banana 2", type: "daughter" },
        { head: "Banana tree 2", tail: "Brown Banana 2", type: "daughter" },
        { head: "Banana tree 2", tail: "Black Banana 2", type: "daughter" },
        { head: "Yellow Banana 2", tail: "Brown Banana 2", type: "sister" },
        { head: "Yellow Banana 2", tail: "Black Banana 2", type: "sister" },
        { head: "Brown Banana 2", tail: "Yellow Banana 2", type: "sister" },
        { head: "Brown Banana 2", tail: "Black Banana 2", type: "sister" },
        { head: "Black Banana 2", tail: "Yellow Banana 2", type: "sister" },
        { head: "Black Banana 2", tail: "Brown Banana 2", type: "sister" },
        { head: "Yellow Banana 2", tail: "Big banana tree 2", type: "parent" },
        { head: "Brown Banana 2", tail: "Big banana tree 2", type: "parent" },
        { head: "Green Banana 2", tail: "Big banana tree 2", type: "parent" },
        { head: "Black Banana 2", tail: "Big banana tree 2", type: "parent" },
        {
          head: "Big banana tree 2",
          tail: "Yellow Banana 2",
          type: "daughter",
        },
        { head: "Big banana tree 2", tail: "Brown Banana 2", type: "daughter" },
        { head: "Big banana tree 2", tail: "Green Banana 2", type: "daughter" },
        { head: "Big banana tree 2", tail: "Black Banana 2", type: "daughter" },
        { head: "Yellow Banana 2", tail: "Brown Banana 2", type: "sister" },
        { head: "Yellow Banana 2", tail: "Green Banana 2", type: "sister" },
        { head: "Yellow Banana 2", tail: "Black Banana 2", type: "sister" },
        { head: "Brown Banana 2", tail: "Yellow Banana 2", type: "sister" },
        { head: "Brown Banana 2", tail: "Green Banana 2", type: "sister" },
        { head: "Brown Banana 2", tail: "Black Banana 2", type: "sister" },
        { head: "Green Banana 2", tail: "Yellow Banana 2", type: "sister" },
        { head: "Green Banana 2", tail: "Brown Banana 2", type: "sister" },
        { head: "Green Banana 2", tail: "Black Banana 2", type: "sister" },
        { head: "Black Banana 2", tail: "Yellow Banana 2", type: "sister" },
        { head: "Black Banana 2", tail: "Brown Banana 2", type: "sister" },
        { head: "Black Banana 2", tail: "Green Banana 2", type: "sister" },
        { head: "Phoneutria Spider 2", tail: "Black Banana 2", type: "parent" },
        {
          head: "Black Banana 2",
          tail: "Phoneutria Spider 2",
          type: "daughter",
        },
      ];

      const duplicated = [
        {
          head: "Copy",
          tail: "Child",
          type: "parent",
        },
        {
          head: "Copy",
          tail: "Child",
          type: "parent",
        },
      ];

      await repository.saveRelations(relations);
      await repository.saveRelations(names);
      await repository.saveRelations(duplicated);
    });

    afterAll(async () => {
      await db.exec("DELETE FROM relations");
    });

    test("it returns an organization relations sorted alphabetically", async () => {
      const server = app({ repository });
      const expected = {
        relations: [
          {
            relationship_type: "parent",
            org_name: "Banana tree 2",
          },
          {
            relationship_type: "parent",
            org_name: "Big banana tree 2",
          },
          {
            relationship_type: "sister",
            org_name: "Brown Banana 2",
          },
          {
            relationship_type: "sister",
            org_name: "Green Banana 2",
          },
          {
            relationship_type: "daughter",
            org_name: "Phoneutria Spider 2",
          },
          {
            relationship_type: "sister",
            org_name: "Yellow Banana 2",
          },
        ],
        pagination: {
          prev_cursor: "Banana tree 2",
          next_cursor: null,
        },
      };

      await supertest(server)
        .get("/organization/Black Banana 2/relations")
        .expect(200, expected);
    });

    test("it returns a maximum of 5 organization's relations sorted alphabetically", async () => {
      const server = app({ repository });

      await supertest(server)
        .get("/organization/Parent/relations")
        .query({ limit: 5 })
        .expect(200, {
          relations: [
            { relationship_type: "parent", org_name: "Abbey" },
            { relationship_type: "parent", org_name: "Abby" },
            { relationship_type: "parent", org_name: "Abella" },
            { relationship_type: "parent", org_name: "Abigail" },
            { relationship_type: "parent", org_name: "Abla" },
          ],
          pagination: { prev_cursor: "Abbey", next_cursor: "Abla" },
        });
    });

    test("it returns the next page of an organization's relations", async () => {
      const server = app({ repository });

      await supertest(server)
        .get("/organization/Parent/relations")
        .query({ limit: 5, after: "Abla" })
        .expect(200, {
          relations: [
            { relationship_type: "parent", org_name: "Abra" },
            { relationship_type: "parent", org_name: "Acacia" },
            { relationship_type: "parent", org_name: "Ada" },
            { relationship_type: "parent", org_name: "Adamina" },
            { relationship_type: "parent", org_name: "Adara" },
          ],
          pagination: { prev_cursor: "Abra", next_cursor: "Adara" },
        });
    });

    test("it returns the previous page of an organization's relations", async () => {
      const server = app({ repository });

      await supertest(server)
        .get("/organization/Parent/relations")
        .query({ limit: 5, before: "Ailani" })
        .expect(200, {
          relations: [
            { relationship_type: "parent", org_name: "Aesha" },
            { relationship_type: "parent", org_name: "Agatha" },
            { relationship_type: "parent", org_name: "Aggie" },
            { relationship_type: "parent", org_name: "Agnes" },
            { relationship_type: "parent", org_name: "Aida" },
          ],
          pagination: { prev_cursor: "Aesha", next_cursor: "Aida" },
        });
    });

    test("it handles page navigation", async () => {
      const server = app({ repository });

      await supertest(server)
        .get("/organization/Parent/relations")
        .query({ limit: 5, after: "Aida" })
        .expect(200, {
          relations: [
            { relationship_type: "parent", org_name: "Ailani" },
            { relationship_type: "parent", org_name: "Aileen" },
            { relationship_type: "parent", org_name: "Ailsa" },
            { relationship_type: "parent", org_name: "Aimee" },
            { relationship_type: "parent", org_name: "Airlia" },
          ],
          pagination: { prev_cursor: "Ailani", next_cursor: "Airlia" },
        });

      await supertest(server)
        .get("/organization/Parent/relations")
        .query({ limit: 5, before: "Ailani" })
        .expect(200, {
          relations: [
            { relationship_type: "parent", org_name: "Aesha" },
            { relationship_type: "parent", org_name: "Agatha" },
            { relationship_type: "parent", org_name: "Aggie" },
            { relationship_type: "parent", org_name: "Agnes" },
            { relationship_type: "parent", org_name: "Aida" },
          ],
          pagination: { prev_cursor: "Aesha", next_cursor: "Aida" },
        });
    });

    test("it returns an organization's relations without duplicates", async () => {
      const server = app({ repository });

      await supertest(server)
        .get("/organization/Copy/relations")
        .query({ limit: 5, after: "Adamina" })
        .expect(200, {
          relations: [{ relationship_type: "parent", org_name: "Child" }],
          pagination: { prev_cursor: "Child", next_cursor: null },
        });
    });
  });
});
