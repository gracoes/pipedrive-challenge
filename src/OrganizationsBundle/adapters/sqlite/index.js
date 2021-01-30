export default {
  init: async (dbClient) => {
    await dbClient.exec(
      `
          CREATE TABLE 
          IF NOT EXISTS relations (
            head TEXT,
            tail TEXT,
            type TEXT,
            UNIQUE(head, tail, type)
          )
        `
    );

    await dbClient.exec(
      "CREATE INDEX IF NOT EXISTS head_tail on relations (head, tail)"
    );

    return {
      batchInsert,
      queryByNamePaginated,
    };

    async function batchInsert(records) {
      try {
        const statements = await Promise.all(
          records.flatMap((row) => prepareInsert(row))
        );

        await dbClient.exec("BEGIN TRANSACTION");
        await Promise.all(
          statements.map((stmt) =>
            stmt.run().then(({ stmt }) => stmt.finalize())
          )
        );
        await dbClient.exec("COMMIT TRANSACTION");

        return true;
      } catch (err) {
        await dbClient.exec("ROLLBACK TRANSACTION");

        throw new Error(err.message);
      }
    }

    async function queryByNamePaginated({
      name,
      before = null,
      after = null,
      limit,
    }) {
      const query = await prepareQueryByName({ name, before, after, limit });

      return query.all();
    }

    function prepareInsert({ head, tail, type }) {
      return dbClient.prepare(
        `INSERT INTO relations (head, tail, type) VALUES (?, ?, ?)
         ON CONFLICT (head, tail, type) DO NOTHING`,
        [head, tail, type]
      );
    }

    function prepareQueryByName({ name, before = null, after = null, limit }) {
      if (before) {
        return dbClient.prepare(
          `
          WITH relations_desc as
          (
            SELECT * from relations WHERE head = :name AND tail < :before ORDER BY tail DESC LIMIT :limit 
          )
          SELECT * from relations_desc ORDER BY tail ASC
          `,
          [name, before, limit]
        );
      }

      if (after) {
        return dbClient.prepare(
          "SELECT * FROM relations WHERE head = :name AND tail > :after LIMIT :limit",
          [name, after, limit]
        );
      }

      return dbClient.prepare(
        "SELECT * FROM relations WHERE head = :name LIMIT :limit",
        [name, limit]
      );
    }
  },
};
