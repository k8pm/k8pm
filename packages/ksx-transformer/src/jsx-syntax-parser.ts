module.exports = () => {
  return {
    manipulateOptions: function manipulateOptions(opts: any, parserOpts: any) {
      parserOpts.plugins.push("jsx");
    },
  };
};
