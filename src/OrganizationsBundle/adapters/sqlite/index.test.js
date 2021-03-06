import { jest } from "@jest/globals";

import Adapter from "./index.js";
import InMemorySqliteClient from "../../../Infrastructure/in-memory-sqlite-client.js";
import RelationshipType from "../../enums/relationship-type.js";

describe("SQLite Adapter", () => {
  let db;
  beforeAll(async () => {
    db = await InMemorySqliteClient.init();
  });

  afterAll(async () => {
    await db.exec("DROP TABLE relations");
    await db.close();
  });

  afterEach(async () => {
    await db.exec("DELETE FROM relations");
  });

  describe("init", () => {
    test("it creates relations table when initiated", async () => {
      await Adapter.init(db);

      const records = await db.all("SELECT * FROM relations");

      expect(records).toEqual([]);
    });

    test("it creates index on relations table when initiated", async () => {
      await Adapter.init(db);

      const index = await db.all(
        "SELECT * FROM sqlite_master WHERE type = 'index' AND name = 'head_tail'"
      );

      expect(index).toHaveLength(1);
    });
  });

  describe("BatchInsert", () => {
    test("it inserts multiple records", async () => {
      const adapter = await Adapter.init(db);

      const res = await adapter.batchInsert([
        { head: "Parent", tail: "Child 2", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 1", type: RelationshipType.PARENT },
      ]);

      const row = await db.get("SELECT * FROM relations");

      expect(res).toBeTruthy();
      expect(row).toEqual({
        head: "Parent",
        tail: "Child 2",
        type: RelationshipType.PARENT,
      });
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
      const adapter = await Adapter.init(mockDb);
      const insertMany = () =>
        adapter.batchInsert([
          { head: "Parent", tail: "Child 1", type: RelationshipType.PARENT },
          { head: "Parent", tail: "Child 2", type: RelationshipType.PARENT },
        ]);

      await expect(insertMany).rejects.toThrow("Something went wrong!");

      const records = await db.all("SELECT * FROM relations");

      expect(records).toHaveLength(0);
    });
  });

  describe("QueryByNamePaginated", () => {
    test("it queries records by name", async () => {
      const adapter = await Adapter.init(db);

      await db.exec(
        "INSERT INTO relations VALUES ('Parent', 'Child 2', 'parent')"
      );
      await db.exec(
        "INSERT INTO relations VALUES ('Parent', 'Child 1', 'parent')"
      );

      const records = await adapter.queryByNamePaginated({
        name: "Parent",
        limit: 10,
      });

      expect(records).toEqual([
        { head: "Parent", tail: "Child 1", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 2", type: RelationshipType.PARENT },
      ]);
    });

    test("it queries records by name and returns them sorted alphabetically", async () => {
      const adapter = await Adapter.init(db);

      await db.exec(
        "INSERT INTO relations VALUES ('Parent', 'Child 2', 'parent')"
      );
      await db.exec(
        "INSERT INTO relations VALUES ('Parent', 'Child 1', 'parent')"
      );
      await db.exec(
        "INSERT INTO relations VALUES ('Parent', 'Child 3', 'parent')"
      );

      const records = await adapter.queryByNamePaginated({
        name: "Parent",
        limit: 5,
      });

      expect(records).toEqual([
        { head: "Parent", tail: "Child 1", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 2", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 3", type: RelationshipType.PARENT },
      ]);
    });

    test("it queries records by name with 'before' pagination", async () => {
      const adapter = await Adapter.init(db);

      for (let idx = 1; idx < 10; idx++) {
        await db.exec(
          `INSERT INTO relations VALUES ('Parent', 'Child ${idx}', 'parent')`
        );
      }

      const records = await adapter.queryByNamePaginated({
        name: "Parent",
        before: "Child 5",
        limit: 2,
      });

      expect(records).toEqual([
        { head: "Parent", tail: "Child 3", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 4", type: RelationshipType.PARENT },
      ]);
    });

    test("it queries records by name with 'after' pagination", async () => {
      const adapter = await Adapter.init(db);

      for (let idx = 1; idx < 10; idx++) {
        await db.exec(
          `INSERT INTO relations VALUES ('Parent', 'Child ${idx}', 'parent')`
        );
      }

      const records = await adapter.queryByNamePaginated({
        name: "Parent",
        after: "Child 5",
        limit: 5,
      });

      expect(records).toEqual([
        { head: "Parent", tail: "Child 6", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 7", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 8", type: RelationshipType.PARENT },
        { head: "Parent", tail: "Child 9", type: RelationshipType.PARENT },
      ]);
    });
  });
});
