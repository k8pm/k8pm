import babel from "@babel/core";

export class KubernetesJSX {
  async transform(code: string) {
    const result = await babel.transformAsync(code, {
      plugins: ["ksx-babel-plugin", "./jsx-syntax-parser"],
      presets: ["react"],
    });

    return result?.code;
  }
}
