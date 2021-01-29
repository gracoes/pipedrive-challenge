import { jest } from "@jest/globals";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

import Adapter from "../../../adapters/sqlite/index.js";
import fixtures from "./names.js";
import getHandler from "../index.js";
import Repository from "../../../repository/index.js";

describe("Get organizations's relations handler - Functional", () => {
  let db;
  let repository;
  beforeAll(async () => {
    db = await open({
      filename: ":memory:",
      driver: sqlite3.Database,
    });
    const adapter = await Adapter(db);
    repository = Repository(adapter);

    const relations = fixtures.names.map((name) => ({
      head: "Parent",
      tail: `${name}`,
      type: "parent",
    }));

    await repository.saveRelations(relations);
  });

  afterAll(async () => {
    await db.exec("DELETE FROM relations");
    await db.close();
  });

  test("it returns the first 100 'Parent' relations", async () => {
    const handler = getHandler(repository);
    const req = {
      query: {},
      params: {
        name: "Parent",
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(200);

        return res;
      }),
      json: jest.fn(({ relations }) => {
        expect(relations).toHaveLength(100);
      }),
    };

    await handler(req, res);

    expect.assertions(2);
  });

  test("it returns the last 50 'Parent' relations", async () => {
    const handler = getHandler(repository);
    const req = {
      query: {
        after: "Balvino",
      },
      params: {
        name: "Parent",
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(200);

        return res;
      }),
      json: jest.fn(({ relations }) => {
        expect(relations).toHaveLength(50);
      }),
    };

    await handler(req, res);

    expect.assertions(2);
  });

  test("it returns the middle 50 'Parent' relations", async () => {
    const handler = getHandler(repository);
    const req = {
      query: {
        after: "Alessandra",
      },
      params: {
        name: "Parent",
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(200);

        return res;
      }),
      json: jest.fn(({ relations }) => {
        expect(relations).toHaveLength(100);
        expect(relations[0].org_name).toEqual("Alethea");
        expect(relations[99].org_name).toEqual("Basilia");
      }),
    };

    await handler(req, res);

    expect.assertions(4);
  });
});
