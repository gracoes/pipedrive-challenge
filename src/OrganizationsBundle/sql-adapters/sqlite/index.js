export default function (dbClient) {
  return {
    batchInsert: (rows) => _batchInsert(dbClient, rows),
  };
}

async function _batchInsert(client, rows) {
  const statements = await Promise.all(
    rows.map((row) => prepareInsert(client, row))
  );

  await client.exec("BEGIN TRANSACTION");
  await Promise.all(
    statements.map((stmt) => stmt.run().then(({ stmt }) => stmt.finalize()))
  );
  await client.exec("COMMIT TRANSACTION");

  return true;
}

function prepareInsert(client, { head, tail, type }) {
  return client.prepare(
    "INSERT INTO relations (head, tail, type) VALUES (?, ?, ?)",
    [head, tail, type]
  );
}
