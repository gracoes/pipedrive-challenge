import mapRelations from "./index.js";
import RelationshipType from "../../../enums/relationship-type.js";

describe("Relations Mapper", () => {
  test("maps relations with max depth of 0", () => {
    const organization = {
      org_name: "Bachelor",
    };
    const relations = mapRelations(organization);

    expect(relations).toEqual([]);
  });

  test("maps relations with max depth of 1", () => {
    const organization = {
      org_name: "Parent",
      daughters: [
        {
          org_name: "Child 1",
        },
        {
          org_name: "Child 2",
        },
      ],
    };

    const relations = mapRelations(organization);

    expect(relations).toEqual(
      expect.arrayContaining([
        { head: "Parent", tail: "Child 1", type: RelationshipType.CHILD },
        { head: "Parent", tail: "Child 2", type: RelationshipType.CHILD },
      ])
    );
    expect(relations).toEqual(
      expect.arrayContaining([
        { head: "Child 1", tail: "Parent", type: RelationshipType.PARENT },
        { head: "Child 2", tail: "Parent", type: RelationshipType.PARENT },
      ])
    );
    expect(relations).toEqual(
      expect.arrayContaining([
        { head: "Child 1", tail: "Child 2", type: RelationshipType.SIBLING },
        { head: "Child 2", tail: "Child 1", type: RelationshipType.SIBLING },
      ])
    );
  });

  test("maps relations with max depth of 2", () => {
    const organization = {
      org_name: "Parent",
      daughters: [
        {
          org_name: "Child 1",
          daughters: [
            {
              org_name: "Child 1.1",
            },
            {
              org_name: "Child 1.2",
            },
          ],
        },
        {
          org_name: "Child 2",
        },
      ],
    };

    const relations = mapRelations(organization);

    expect(relations).toEqual(
      expect.arrayContaining([
        { head: "Parent", tail: "Child 1", type: RelationshipType.CHILD },
        { head: "Parent", tail: "Child 2", type: RelationshipType.CHILD },
        { head: "Child 1", tail: "Child 1.1", type: RelationshipType.CHILD },
        { head: "Child 1", tail: "Child 1.2", type: RelationshipType.CHILD },
      ])
    );
    expect(relations).toEqual(
      expect.arrayContaining([
        { head: "Child 1", tail: "Parent", type: RelationshipType.PARENT },
        { head: "Child 2", tail: "Parent", type: RelationshipType.PARENT },
        { head: "Child 1.1", tail: "Child 1", type: RelationshipType.PARENT },
        { head: "Child 1.2", tail: "Child 1", type: RelationshipType.PARENT },
      ])
    );
    expect(relations).toEqual(
      expect.arrayContaining([
        { head: "Child 1", tail: "Child 2", type: RelationshipType.SIBLING },
        { head: "Child 2", tail: "Child 1", type: RelationshipType.SIBLING },
        {
          head: "Child 1.1",
          tail: "Child 1.2",
          type: RelationshipType.SIBLING,
        },
        {
          head: "Child 1.2",
          tail: "Child 1.1",
          type: RelationshipType.SIBLING,
        },
      ])
    );
  });
});
