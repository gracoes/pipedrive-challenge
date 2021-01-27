export default function (repository) {
  return async (req, res) => {
    try {
      const { name } = req.params;
      const { lastSeen } = req.query;
      const { items, lastRecord } = await repository.findByOrganization({
        name,
        lastSeen,
      });

      return res.status(200).json({ relations: items, lastSeen: lastRecord });
    } catch ({ message }) {
      return res.status(500).json({ message });
    }
  };
}
