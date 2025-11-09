export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all variable declarations
  root.find(j.VariableDeclarator).forEach(path => {
    if (!path.node.id) {
      console.log('path.node.id is null for path:', path);
      return;
    }
    const varName = path.node.id.name;
    const scope = path.scope;

    // Find all references to the variable in the current scope
    const references = scope.getBindings()[varName];

    if (references && references.length === 0) {
      // If there are no references, prefix the variable name with an underscore
      const newName = `_${varName}`;
      
      // Rename the variable declaration
      j(path).find(j.Identifier).forEach(idPath => {
        if (idPath.node.name === varName) {
          idPath.node.name = newName;
        }
      });
    }
  });

  return root.toSource();
}
