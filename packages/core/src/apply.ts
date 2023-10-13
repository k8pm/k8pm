import type { AbstractApiMethodNames } from "@fr8/k8s";
import { AbstractApi } from "@fr8/k8s";
import YAML from "yaml";

export const apply = async (yml: string, action: AbstractApiMethodNames) => {
  const abstractApi = new AbstractApi();
  const components = yml.split("---").map((y) => YAML.parse(y));
  const manifests = components.map((c) => {
    const kind = c.kind as string;
    const metadata = c.metadata;
    const spec = c.spec;
    return {
      kind,
      metadata,
      spec,
    };
  });

  await Promise.all(
    manifests.map(async (manifest) => {
      const { kind, metadata, spec } = manifest;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- we know this is a string
      const methodName = abstractApi.getMethodName(action, kind);
      const api = abstractApi.getApi(kind);
      const namespace = metadata.namespace;
      const body = spec;

      if (!namespace) {
        throw new Error("Namespace is required");
      }

      try {
        const result = await api[methodName](namespace, body);
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    })
  );
};
