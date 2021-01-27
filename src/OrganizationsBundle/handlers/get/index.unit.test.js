import { jest } from "@jest/globals";

import getHandler from "./index.js";

describe("Get organizations's relations handler", () => {
  test("it returns relations for organization 'Parent'", async () => {
    const repository = {
      findByOrganization: jest.fn(() =>
        Promise.resolve([
          {
            relationship_type: "child",
            org_name: "Child 1",
          },
        ])
      ),
    };
    const handler = getHandler(repository);
    const req = {
      params: {
        name: "Parent",
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(200);

        return res;
      }),
      json: jest.fn((value) =>
        expect(value).toEqual([
          {
            relationship_type: "child",
            org_name: "Child 1",
          },
        ])
      ),
    };

    await handler(req, res);

    expect(repository.findByOrganization).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });
});
