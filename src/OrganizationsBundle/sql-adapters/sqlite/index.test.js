import { jest } from "@jest/globals";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

import Adapter from "./index.js";

describe("SQLite Adapter", () => {
  let db;
  beforeAll(async () => {
    db = await open({
      filename: ":memory:",
      driver: sqlite3.Database,
    });
  });

  afterAll(async () => {
    await db.exec("DROP TABLE relations");
    await db.close();
  });

  afterEach(async () => {
    await db.exec("DELETE FROM relations");
  });

  test("it creates relations table when initiated", async () => {
    await Adapter(db);

    const records = await db.all("SELECT * FROM relations");

    expect(records).toEqual([]);
  });

  test("it creates index on relations table when initiated", async () => {
    await Adapter(db);

    const records = await db.all(
      "SELECT * FROM sqlite_master WHERE type = 'index' AND name = 'head_tail'"
    );

    expect(records).toHaveLength(1);
  });

  test("it inserts multiple records", async () => {
    const adapter = await Adapter(db);

    const res = await adapter.batchInsert([
      { head: "Parent", tail: "Child 1", type: "parent" },
    ]);

    const row = await db.get("SELECT * FROM relations");

    expect(res).toBeTruthy();
    expect(row).toEqual({ head: "Parent", tail: "Child 1", type: "parent" });
  });

  test("inserting multiple records is atomic", async () => {
    const mockDb = {
      exec: jest.fn(() => Promise.resolve()),
      prepare: jest
        .fn()
        .mockImplementationOnce((statement, params) =>
          db.prepare(statement, params)
        )
        .mockImplementationOnce(() =>
          Promise.reject({ message: "Something went wrong!" })
        ),
    };
    const adapter = await Adapter(mockDb);
    const insertMany = () =>
      adapter.batchInsert([
        { head: "Parent", tail: "Child 1", type: "parent" },
        { head: "Parent", tail: "Child 2", type: "parent" },
      ]);

    await expect(insertMany).rejects.toThrow("Something went wrong!");

    const records = await db.all("SELECT * FROM relations");

    expect(records).toHaveLength(0);
  });

  test("it fetches records by name ", async () => {
    const adapter = await Adapter(db);

    await db.exec(
      "INSERT INTO relations VALUES ('Parent', 'Child 2', 'parent')"
    );
    await db.exec(
      "INSERT INTO relations VALUES ('Parent', 'Child 1', 'parent')"
    );

    const rows = await adapter.fetchAllByName("Parent");

    expect(rows).toEqual(
      expect.arrayContaining([
        { head: "Parent", tail: "Child 1", type: "parent" },
        { head: "Parent", tail: "Child 2", type: "parent" },
      ])
    );
  });
});
