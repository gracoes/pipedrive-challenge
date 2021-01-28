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
      before = null,
      after = null,
      limit = DEFAULT_MAX_ROWS_PER_PAGE,
    }) => {
      try {
        const records = await adapter.queryByNamePaginated({
          name,
          before,
          after,
          limit,
        });

        const items = records.map(({ tail, type }) => ({
          relationship_type: type,
          org_name: tail,
        }));

        const isLastPage = records.length < limit;
        const exclusiveStartKey = isLastPage ? null : records[limit - 1].tail;

        return {
          items,
          exclusiveStartKey,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  };
}
