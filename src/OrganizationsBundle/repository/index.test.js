import { jest } from "@jest/globals";

import Repository from "./index.js";

describe("Organizations Repository", () => {
  test("it saves relations", async () => {
    const adapter = { batchInsert: jest.fn(() => Promise.resolve()) };
    const repository = Repository(adapter);

    const res = await repository.saveRelations([
      { head: "Parent", tail: "Child 1", type: "parent" },
    ]);

    expect(res).toBeTruthy();
    expect(adapter.batchInsert).toHaveBeenCalledTimes(1);
  });

  test("it returns relations of an organization", async () => {
    const adapter = {
      fetchAllByName: jest.fn(() =>
        Promise.resolve([
          {
            head: "Parent",
            tail: "Child 1",
            type: "child",
          },
        ])
      ),
    };
    const repository = Repository(adapter);
    const records = await repository.findByOrganization("Parent");

    expect(records).toEqual([
      {
        relationship_type: "child",
        org_name: "Child 1",
      },
    ]);
  });
});
