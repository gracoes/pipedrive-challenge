export default function (adapter) {
  return {
    saveRelations: async (relations) => {
      try {
        await adapter.batchInsert(relations);

        return true;
      } catch (err) {
        console.error("Someting went wrong");

        return false;
      }
    },
  };
}
