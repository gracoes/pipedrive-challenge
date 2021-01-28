import { jest } from "@jest/globals";

import getHandler from "../index.js";

describe("Get organizations's relations handler", () => {
  test("it returns with success relations for organization 'Parent'", async () => {
    const repository = {
      findByOrganization: jest.fn(() =>
        Promise.resolve({
          items: [
            {
              relationship_type: "child",
              org_name: "Child 1",
            },
            {
              relationship_type: "child",
              org_name: "Child 2",
            },
          ],
          exclusiveStartKey: null,
        })
      ),
    };
    const handler = getHandler(repository);
    const req = {
      params: {
        name: "Parent",
      },
      query: {},
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(200);

        return res;
      }),
      json: jest.fn((value) =>
        expect(value).toEqual({
          relations: [
            {
              relationship_type: "child",
              org_name: "Child 1",
            },
            {
              relationship_type: "child",
              org_name: "Child 2",
            },
          ],
          pagination: {
            next_cursor: null,
          },
        })
      ),
    };

    await handler(req, res);

    expect(repository.findByOrganization).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });

  test("it returns with error status when failing", async () => {
    const repository = {
      findByOrganization: jest.fn(() =>
        Promise.reject({ message: "Something went wrong!" })
      ),
    };
    const handler = getHandler(repository);
    const req = {
      params: {
        name: "Parent",
      },
      query: {},
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(500);

        return res;
      }),
      json: jest.fn((value) =>
        expect(value).toEqual({ message: "Something went wrong!" })
      ),
    };

    await handler(req, res);

    expect(repository.findByOrganization).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });
});
