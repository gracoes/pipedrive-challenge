export default function (repository) {
  return async (req, res) => {
    try {
      const { name } = req.params;
      const { before, after } = req.query;
      const { items, exclusiveStartKey } = await repository.findByOrganization({
        name,
        before,
        after,
      });

      return res.status(200).json({
        relations: items,
        pagination: {
          next_cursor: exclusiveStartKey,
        },
      });
    } catch ({ message }) {
      return res.status(500).json({ message });
    }
  };
}
