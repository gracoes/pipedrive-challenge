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
      after = null,
      limit = DEFAULT_MAX_ROWS_PER_PAGE,
    }) => {
      try {
        const records = await adapter.queryByNamePaginated({
          name,
          after,
          limit,
        });

        const items = records.map(({ tail, type }) => ({
          relationship_type: type,
          org_name: tail,
        }));

        const isLastPage = records.length < limit;
        const exclusiveNextKey = isLastPage ? null : records[limit - 1].tail;

        return {
          items,
          exclusivePrevKey: records.length ? records[0].tail : null,
          exclusiveNextKey,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  };
}
