import { jest } from "@jest/globals";

import createHandler from "./index.js";

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
