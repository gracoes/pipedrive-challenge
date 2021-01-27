const DEFAULT_MAX_ROWS_PER_PAGE = 100;

export default function (adapter) {
  return {
    saveRelations: async (relations) => {
      try {
        await adapter.batchInsert(relations);

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
    findByOrganization: async ({
      name,
      lastSeen,
      limit = DEFAULT_MAX_ROWS_PER_PAGE,
    }) => {
      try {
        const records = await adapter.queryByNamePaginated({
          name,
          lastSeen,
          limit,
        });
        const lastRecordIdx = records.length < limit ? records.length : limit;
        const { tail } = records[lastRecordIdx - 1];

        const items = records.map(({ tail, type }) => ({
          relationship_type: type,
          org_name: tail,
        }));

        return {
          items,
          lastRecord: tail,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  };
}
