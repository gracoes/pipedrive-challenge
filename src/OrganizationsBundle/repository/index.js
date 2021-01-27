export default function (adapter) {
  return {
    saveRelations: async (relations) => {
      try {
        await adapter.batchInsert(relations);

        return true;
      } catch (err) {
        console.error("Something went wrong");

        throw new Error(err.message);
      }
    },
    findByOrganization: async (organization) => {
      try {
        const records = await adapter.fetchAllByName(organization);

        return records.map(({ tail, type }) => ({
          relationship_type: type,
          org_name: tail,
        }));
      } catch (err) {
        console.error("Something went wrong");

        throw new Error();
      }
    },
  };
}
