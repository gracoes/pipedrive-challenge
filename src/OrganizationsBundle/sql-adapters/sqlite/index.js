export default async function Adapter(dbClient) {
  await dbClient.exec(
    "CREATE TABLE IF NOT EXISTS relations (head TEXT, tail TEXT, type TEXT, UNIQUE (head,tail,type))"
  );

  await dbClient.exec(
    "CREATE INDEX IF NOT EXISTS head_tail on relations (head, tail)"
  );

  async function batchInsert(records) {
    try {
      const statements = await Promise.all(
        records.map((row) => prepareInsert(row))
      );

      await dbClient.exec("BEGIN TRANSACTION");
      await Promise.all(
        statements.map((stmt) => stmt.run().then(({ stmt }) => stmt.finalize()))
      );
      await dbClient.exec("COMMIT TRANSACTION");

      return true;
    } catch (err) {
      await dbClient.exec("ROLLBACK TRANSACTION");

      throw new Error(err.message);
    }
  }

  function prepareInsert({ head, tail, type }) {
    return dbClient.prepare(
      "INSERT INTO relations (head, tail, type) VALUES (?, ?, ?)",
      [head, tail, type]
    );
  }

  function fetchAllByName(name) {
    return dbClient.all("SELECT * FROM relations WHERE head = :name", [name]);
  }

  return {
    batchInsert,
    fetchAllByName,
  };
}
