import { jest } from "@jest/globals";

import createHandler from "./index.js";

describe("Create Relations Handler", () => {
  test("it creates relations and responds with success", async () => {
    const repo = {
      saveRelations: jest.fn(() => Promise.resolve(true)),
    };
    const handler = createHandler(repo);
    const req = {
      body: {
        org_name: "Parent",
        daughters: [
          {
            org_name: "Child 1",
          },
        ],
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(201);

        return res;
      }),
      json: jest.fn((value) => expect(value).toEqual({ success: true })),
    };
    await handler(req, res);

    expect(repo.saveRelations).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });

  test("it returns 400 - Bad Request when request has no daughters", async () => {
    const repo = {
      saveRelations: jest.fn(),
    };
    const handler = createHandler(repo);
    const req = {
      body: {
        org_name: "Parent",
        daughters: [],
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(400);

        return res;
      }),
      json: jest.fn((value) =>
        expect(value).toEqual({
          error: "Organization 'Parent' must have daughters",
        })
      ),
    };
    await handler(req, res);

    expect(repo.saveRelations).not.toHaveBeenCalled();
    expect.assertions(3);
  });

  test("it returns 400 - Bad Request when request has no org_name", async () => {
    const repo = {
      saveRelations: jest.fn(),
    };
    const handler = createHandler(repo);
    const req = {
      body: {
        daughters: [],
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(400);

        return res;
      }),
      json: jest.fn((value) =>
        expect(value).toEqual({
          error: "Property 'org_name' must be present",
        })
      ),
    };
    await handler(req, res);

    expect(repo.saveRelations).not.toHaveBeenCalled();
    expect.assertions(3);
  });

  test("it returns 500 - Internal Server Error when request fails", async () => {
    const repo = {
      saveRelations: jest.fn(() =>
        Promise.reject({ message: "Something went wrong!" })
      ),
    };
    const handler = createHandler(repo);
    const req = {
      body: {
        org_name: "Parent",
        daughters: [
          {
            org_name: "Child 1",
          },
        ],
      },
    };
    const res = {
      status: jest.fn((status) => {
        expect(status).toEqual(500);

        return res;
      }),
      json: jest.fn((value) =>
        expect(value).toEqual({
          error: "Something went wrong!",
        })
      ),
    };
    await handler(req, res);

    expect(repo.saveRelations).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });
});
