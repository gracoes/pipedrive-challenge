import { jest } from "@jest/globals";

import RelationshipType from "../enums/relationship-type.js";
import Repository from "./index.js";

describe("Organizations Repository", () => {
  test("it saves relations", async () => {
    const adapter = { batchInsert: jest.fn(() => Promise.resolve()) };
    const repository = Repository(adapter);

    const res = await repository.saveRelations([
      { head: "Parent", tail: "Child 1", type: RelationshipType.PARENT },
    ]);

    expect(res).toBeTruthy();
    expect(adapter.batchInsert).toHaveBeenCalledTimes(1);
  });

  test("it returns relations of an organization", async () => {
    const adapter = {
      queryByNamePaginated: jest.fn(() =>
        Promise.resolve([
          {
            head: "Parent",
            tail: "Child 1",
            type: RelationshipType.CHILD,
          },
        ])
      ),
    };
    const repository = Repository(adapter);
    const records = await repository.findByOrganization({ name: "Parent" });

    expect(records).toEqual({
      items: [
        {
          relationship_type: RelationshipType.CHILD,
          org_name: "Child 1",
        },
      ],
      exclusivePrevKey: "Child 1",
      exclusiveNextKey: null,
    });
  });

  test("it returns empty set when organization has no relations", async () => {
    const adapter = {
      queryByNamePaginated: jest.fn(() => Promise.resolve([])),
    };
    const repository = Repository(adapter);
    const records = await repository.findByOrganization({ name: "Parent" });

    expect(records).toEqual({
      items: [],
      exclusivePrevKey: null,
      exclusiveNextKey: null,
    });
  });
});
