import mapRelations from "./relations-mapper/index.js";

export default function (repo) {
  return function (req, res) {
    const { org_name, daughters } = req.body;
    if (!org_name || org_name === "") {
      return res.status(400).json({
        error: "Property 'org_name' must be present",
      });
    }

    if (!daughters || !daughters.length) {
      return res.status(400).json({
        error: `Organization '${req.body.org_name}' must have daughters`,
      });
    }

    const relations = mapRelations({ org_name, daughters });

    return repo
      .saveRelations(relations)
      .then(() => res.status(201).json({ success: true }))
      .catch(({ message }) => res.status(500).json({ error: message }));
  };
}
