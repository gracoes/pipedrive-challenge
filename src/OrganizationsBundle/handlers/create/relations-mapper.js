export default function mapRelations({ org_name: orgName, daughters }) {
  if (!daughters) {
    return [];
  }

  const parents = mapParents(orgName, daughters);
  const childs = mapChildren(orgName, daughters);
  const siblings = mapSiblings(daughters);
  const relations = daughters.flatMap((child) => mapRelations(child));

  return [...parents, ...childs, ...siblings, ...relations];
}

function mapParents(parent, children) {
  return children.map(({ org_name }) => {
    return { head: parent, tail: org_name, type: "parent" };
  });
}

function mapChildren(parent, children) {
  return children.map(({ org_name }) => {
    return { head: org_name, tail: parent, type: "daughter" };
  });
}

function mapSiblings(children) {
  return children.flatMap(({ org_name }, __, array) =>
    array
      .filter(({ org_name: org }) => org !== org_name)
      .map(({ org_name: org }) => {
        return { head: org_name, tail: org, type: "sister" };
      })
  );
}
