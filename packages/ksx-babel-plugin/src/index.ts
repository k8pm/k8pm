module.exports = (babel) => {
  const t = babel.types;
  return {
    name: "ksx-plugin",
    visitor: {
      JSXElement(path) {
        //get the opening element from jsxElement node
        const openingElement = path.node.openingElement;
        //tagname is name of tag like div, p etc
        const tagName = openingElement.name.name;
        // arguments for React.createElement function
        const args = [];
        //adds "div" or any tag as a string as one of the argument
        args.push(t.stringLiteral(tagName));
        // as we are considering props as null for now
        const attribs = t.nullLiteral();
        //push props or other attributes which is null for now
        args.push(attribs);
        // order in AST Top to bottom -> (CallExpression => MemberExpression => Identifiers)
        // below are the steps to create a callExpression
        const chartIdentifier = t.identifier("Chart"); //object
        const createElementIdentifier = t.identifier("addComponent"); //property of object
        const callee = t.memberExpression(
          chartIdentifier,
          createElementIdentifier
        );
        const callExpression = t.callExpression(callee, args);
        //now add children as a third argument
        callExpression.arguments = callExpression.arguments.concat(
          path.node.children
        );
        // replace jsxElement node with the call expression node made above
        path.replaceWith(callExpression, path.node);
      },
    },
  };
};
