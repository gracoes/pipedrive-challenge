import Adapter from "./index.js";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

let db;
beforeAll(async () => {
  db = await open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });

  await db.exec("CREATE TABLE relations (head TEXT, tail TEXT, type TEXT)");
});

afterAll(async () => {
  await db.exec("DROP TABLE relations");
  await db.close();
});

beforeEach(async () => {
  await db.exec("DELETE FROM relations");
});

test("batch insert", async () => {
  const adapter = Adapter(db);

  const res = await adapter.batchInsert([
    { head: "Parent", tail: "Child 1", type: "parent" },
  ]);

  const row = await db.get("SELECT * FROM relations");

  expect(res).toBeTruthy();
  expect(row).toEqual({ head: "Parent", tail: "Child 1", type: "parent" });
});
