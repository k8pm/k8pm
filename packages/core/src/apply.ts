import type { AbstractApiMethodNames } from "@fr8/k8s";
import { AbstractApi } from "@fr8/k8s";
import YAML from "yaml";

/**
 * Parse YAML string and call the appropriate k8s API method
 * @param yml - The YAML string to parse
 * @param action - The k8s API method to call (e.g. create, update, delete)
 */
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
      const { kind, metadata } = manifest;
      const methodName = abstractApi.getMethodName(action, kind);
      const api = abstractApi.getApi(kind);

      const namespace = metadata.namespace;

      if (!namespace) {
        throw new Error("Namespace is required");
      }

      const result = await api[methodName](namespace, manifest);
      return result;
    })
  );
};
