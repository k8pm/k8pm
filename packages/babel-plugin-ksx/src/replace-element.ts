import { types } from "@babel/core";
import type { NodePath } from "@babel/core";

export const replaceElement = (path: NodePath<types.JSXElement>, args: {
  class
}) => {
  const t = types;

    // order in AST Top to bottom -> (CallExpression => MemberExpression => Identifiers)
    // below are the steps to create a callExpression
    const chartIdentifier = t.identifier("Chart"); //object
    const createElementIdentifier = t.identifier("addComponent"); //property of object
    const callee = t.memberExpression(chartIdentifier, createElementIdentifier);
    const callExpression = t.callExpression(callee, args);
    //now add children as a third argument

    // @todo: this is where we need to add the props
    // callExpression.arguments = callExpression.arguments.concat(
    //   path.node.children
    // );

    // replace jsxElement node with the call expression node made above
    path.replaceWith(callExpression);
  }
};
