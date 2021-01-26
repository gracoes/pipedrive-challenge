import makeRepo from "../../repository/index.js";
import mapRelations from "./relations-mapper.js";

export default function () {
  const repo = makeRepo();

  return function (req, res) {
    const relations = mapRelations(req.body);

    return repo
      .saveRelations(relations)
      .then(() => res.status(200).json({ message: "Success" }));
  };
}
