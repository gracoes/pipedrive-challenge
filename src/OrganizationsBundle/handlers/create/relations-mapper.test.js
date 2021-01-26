import mapRelations from "./relations-mapper.js";

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
      { head: "Parent", tail: "Child 1", type: "parent" },
      { head: "Parent", tail: "Child 2", type: "parent" },
    ])
  );
  expect(relations).toEqual(
    expect.arrayContaining([
      { head: "Child 1", tail: "Parent", type: "daughter" },
      { head: "Child 2", tail: "Parent", type: "daughter" },
    ])
  );
  expect(relations).toEqual(
    expect.arrayContaining([
      { head: "Child 1", tail: "Child 2", type: "sister" },
      { head: "Child 2", tail: "Child 1", type: "sister" },
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
      { head: "Parent", tail: "Child 1", type: "parent" },
      { head: "Parent", tail: "Child 2", type: "parent" },
      { head: "Child 1", tail: "Child 1.1", type: "parent" },
      { head: "Child 1", tail: "Child 1.2", type: "parent" },
    ])
  );
  expect(relations).toEqual(
    expect.arrayContaining([
      { head: "Child 1", tail: "Parent", type: "daughter" },
      { head: "Child 2", tail: "Parent", type: "daughter" },
      { head: "Child 1.1", tail: "Child 1", type: "daughter" },
      { head: "Child 1.2", tail: "Child 1", type: "daughter" },
    ])
  );
  expect(relations).toEqual(
    expect.arrayContaining([
      { head: "Child 1", tail: "Child 2", type: "sister" },
      { head: "Child 2", tail: "Child 1", type: "sister" },
      { head: "Child 1.1", tail: "Child 1.2", type: "sister" },
      { head: "Child 1.2", tail: "Child 1.1", type: "sister" },
    ])
  );
});
