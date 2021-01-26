import { jest } from "@jest/globals";

import Repo from "./";

test("it saves relations", async () => {
  const batchInsert = jest.fn(() => Promise.resolve());
  const adapter = { batchInsert };
  const repo = Repo(adapter);

  const res = await repo.saveRelations([
    { head: "Parent", tail: "Child 1", type: "parent" },
  ]);

  expect(res).toBeTruthy();
  expect(batchInsert).toHaveBeenCalledTimes(1);
});
