import { AbstractApiMethodNames, AbstractApi } from "@k8pm/k8s";
import YAML from "yaml";

/**
 * Parse YAML string and call the appropriate k8s API method
 * @param yml - The YAML string to parse
 * @param action - The k8s API method to call (e.g. create, patch, delete)
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
      const api = abstractApi.getApi(action, kind);
      const methodName = abstractApi.getMethodName(action, kind);
      if (!api) {
        throw new Error(`No API found for ${action}/${kind}`);
      }

      const namespace = metadata.namespace;

      if (!namespace) {
        throw new Error("Namespace is required");
      }
      //console.log("Calling", methodName, namespace, manifest);

      if (action === AbstractApiMethodNames.DELETE) {
        const result = await api[methodName](metadata.name, namespace);
        return result;
      }
      const result = await api[methodName](namespace, manifest);
      return result;
    })
  );
};
