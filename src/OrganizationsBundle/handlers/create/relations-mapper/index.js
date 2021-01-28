import RelationshipType from "../../../enums/relationship-type.js";

export default function mapRelations({ org_name, daughters }) {
  if (!daughters) {
    return [];
  }

  const parents = mapParents(org_name, daughters);
  const childs = mapChildren(org_name, daughters);
  const siblings = mapSiblings(daughters);
  const relations = daughters.flatMap((child) => mapRelations(child));

  return [...parents, ...childs, ...siblings, ...relations];
}

function mapParents(parent, children) {
  return children.map(({ org_name }) => ({
    head: parent,
    tail: org_name,
    type: RelationshipType.PARENT,
  }));
}

function mapChildren(parent, children) {
  return children.map(({ org_name }) => ({
    head: org_name,
    tail: parent,
    type: RelationshipType.CHILD,
  }));
}

function mapSiblings(children) {
  return children.flatMap(({ org_name }, __, array) =>
    array
      .filter(({ org_name: org }) => org !== org_name)
      .map(({ org_name: org }) => ({
        head: org_name,
        tail: org,
        type: RelationshipType.SIBLING,
      }))
  );
}
