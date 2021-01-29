import { open } from "sqlite";
import sqlite3 from "sqlite3";

export default {
  init: () =>
    open({
      filename: ":memory:",
      driver: sqlite3.Database,
    }),
};
