export default function (repository) {
  return async (req, res) => {
    try {
      const { name } = req.params;
      const { before, after, limit } = req.query;
      const {
        items,
        exclusivePrevKey,
        exclusiveNextKey,
      } = await repository.findByOrganization({
        name,
        before,
        after,
        limit,
      });

      return res.status(200).json({
        relations: items,
        pagination: {
          prev_cursor: exclusivePrevKey,
          next_cursor: exclusiveNextKey,
        },
      });
    } catch ({ message }) {
      return res.status(500).json({ message });
    }
  };
}
