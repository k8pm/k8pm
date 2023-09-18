// eslint-disable-next-line import/no-default-export -- babel particularity
export default function jsxSyntaxParser() {
  return {
    manipulateOptions: function manipulateOptions(opts: any, parserOpts: any) {
      parserOpts.plugins.push("jsx");
    },
  };
}
