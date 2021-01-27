export default function (repository) {
  return async (req, res) => {
    const { name } = req.params;
    const relations = await repository.findByOrganization(name);

    return res.status(200).json(relations);
  };
}
