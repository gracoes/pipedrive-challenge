import mapRelations from "./relations-mapper/index.js";

export default function (repo) {
  return function (req, res) {
    const relations = mapRelations(req.body);

    return repo
      .saveRelations(relations)
      .then(() => res.status(200).json({ message: "Success!" }));
  };
}
