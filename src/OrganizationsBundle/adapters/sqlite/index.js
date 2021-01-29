export default {
  init: async (dbClient) => {
    const createTables = [
      dbClient.exec(
        `
          CREATE TABLE 
          IF NOT EXISTS relations (
            head TEXT,
            tail TEXT,
            type TEXT,
            UNIQUE(head, tail, type)
          )
        `
      ),
      dbClient.exec(
        `
          CREATE TABLE 
          IF NOT EXISTS relations_desc (
            head TEXT,
            tail TEXT,
            type TEXT,
            UNIQUE(head, tail, type)
          )
        `
      ),
    ];

    await Promise.all(createTables);

    const createIndices = [
      dbClient.exec(
        "CREATE INDEX IF NOT EXISTS head_tail on relations (head, tail)"
      ),
      dbClient.exec(
        "CREATE INDEX IF NOT EXISTS head_tail_desc on relations_desc (head, tail DESC)"
      ),
    ];

    await Promise.all(createIndices);

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
      const insertStatement = dbClient.prepare(
        `INSERT INTO relations (head, tail, type) VALUES (?, ?, ?)
         ON CONFLICT (head, tail, type) DO NOTHING`,
        [head, tail, type]
      );
      const insertDescStatement = dbClient.prepare(
        `INSERT INTO relations_desc (head, tail, type) VALUES (?, ?, ?)
         ON CONFLICT (head, tail, type) DO NOTHING`,
        [head, tail, type]
      );

      return [insertStatement, insertDescStatement];
    }

    function prepareQueryByName({ name, before = null, after = null, limit }) {
      if (before) {
        return dbClient.prepare(
          `
          WITH relations as
          (
            SELECT * from relations_desc WHERE head = :name AND tail < :before ORDER BY tail DESC LIMIT :limit 
          )
          SELECT * from relations ORDER BY tail ASC
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
