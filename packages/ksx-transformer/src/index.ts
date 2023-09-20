import { transformAsync } from "@babel/core";

export class KubernetesJSX {
  async transform(code: string) {
    const result = await transformAsync(code, {
      plugins: ["ksx"],
      parserOpts: {
        plugins: ["jsx"],
      },
    });

    return result?.code;
  }
}
