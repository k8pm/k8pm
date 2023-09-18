import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
  loadAllYaml,
} from "@kubernetes/client-node";
import type { ApiObject } from "cdk8s";
import type { LoggerInstance } from "logger";
import { Logger } from "logger";

export class K8sClient {
  logger: LoggerInstance;
  kc = new KubeConfig();
  k8Core: CoreV1Api;
  k8Apps: AppsV1Api;
  apiHandlerMapping: Record<string, any> = {};

  constructor() {
    this.logger = new Logger().createLogger("k8s");
    this.kc.loadFromDefault();
    this.k8Core = this.kc.makeApiClient(CoreV1Api);
    this.k8Apps = this.kc.makeApiClient(AppsV1Api);

    // Iterate through the methods exposed by the k8s client
    // and compile a mapping of component kind -> api handler
    [this.k8Core, this.k8Apps].forEach((api) => {
      Object.getOwnPropertyNames(Object.getPrototypeOf(api)).forEach((key) => {
        //this.logger.debug('method', { key });
        if (key.match(/createNamespaced(.*)/g)) {
          const kind = key.replace("createNamespaced", "");
          this.apiHandlerMapping[kind] = api;
        }
      });
    });

    // // The above method is not foolproof
    // // we need to manually specify which API to use for some kinds
    // // of components
    // ['Namespace'].map((kind) => {
    //   this.apiHandlerMapping[kind] = this.k8Core;
    // });
  }

  setContext(context: string) {
    this.kc.setCurrentContext(context);
  }

  getCurrentUser() {
    return this.kc.getCurrentUser();
  }

  getCurrentContext() {
    return this.kc.getCurrentContext();
  }

  getMethodName(
    action: "create" | "patch" | "read" | "list" | "delete",
    kind: string
  ) {
    const methodName = `${action}Namespaced${kind}`;
    return methodName;
  }

  getApi(kind: string) {
    const api = this.apiHandlerMapping[kind];
    if (!api) {
      return null;
    }
    return api;
  }

  get secret() {
    return {
      create: (
        namespace: string,
        name: string,
        stringData: Record<string, string>,
        labels?: Record<string, string>
      ) =>
        this.k8Core.createNamespacedSecret(namespace, {
          metadata: {
            name,
            labels,
          },
          stringData,
        }),
      get: async (secretName: string, namespace: string) =>
        this.k8Core.readNamespacedSecret(secretName, namespace),
      exists: async (namespace: string, name: string) => {
        const result = await this.k8Core.readNamespacedSecret(name, namespace);
        if (result.response.statusCode === 200) {
          return true;
        }
        return false;
      },
      getReleaseSecret: async (namespace: string, name: string) => {
        const result = await this.k8Core.readNamespacedSecret(name, namespace);
        const manifest = JSON.parse(result.body.stringData?.manifest || "");
        return { manifest, meta: result.body.metadata };
      },

      createReleaseSecret: (
        namespace: string,
        name: string,
        manifestYaml: string,
        labels?: Record<string, string>
      ) =>
        this.k8Core.createNamespacedSecret(namespace, {
          metadata: {
            name,
            labels,
          },
          stringData: {
            manifest: manifestYaml,
          },
        }),
      delete: (namespace: string, name: string) =>
        this.k8Core.deleteNamespacedSecret(name, namespace),
      list: (namespace: string) => this.k8Core.listNamespacedSecret(namespace), // @todo: add label selector
    };
  }

  get namespace() {
    return {
      uninstall: async (namespace: string, components: ApiObject[]) => {
        return Promise.all(
          components.map(async (obj) => {
            const { kind } = obj;
            const api = this.getApi(kind);
            if (!api) {
              throw new Error(`No method found for ${kind}`);
            }

            const methodName = this.getMethodName("delete", kind);

            this.logger.debug("Uninstalling", {
              methodName,
              kind,
              meta: obj.metadata,
            });

            const result = await api[methodName](obj.metadata.name, namespace);

            return result;
          })
        );
      },
      install: async (namespace: string, yamlString: string) => {
        // loadYaml returns a string
        // loadAllYaml returns an array of objects
        const json: ApiObject[] = loadAllYaml(yamlString);
        //const yaml = dumpYaml(json);
        this.logger.debug("Install YAML", { json });

        // this.logger.debug('Handlers', {
        //   kinds: Object.keys(this.apiHandlerMapping),
        // });

        return Promise.all(
          json.map(async (obj) => {
            const { kind } = obj;
            const api = this.getApi(kind);
            if (!api) {
              throw new Error(`No method found for ${kind}`);
            }

            const methodName = this.getMethodName("create", kind);

            const result = await api[methodName](namespace, obj);

            return result;
          })
        );
      },
      upgrade: async (namespace: string, yamlString: string) => {
        // loadYaml returns a string
        // loadAllYaml returns an array of objects
        const json: ApiObject[] = loadAllYaml(yamlString);
        //const yaml = dumpYaml(json);
        this.logger.debug("Upgrade YAML", { json });

        // this.logger.debug('Handlers', {
        //   kinds: Object.keys(this.apiHandlerMapping),
        // });

        return Promise.all(
          json.map(async (obj) => {
            const { kind } = obj;
            const api = this.getApi(kind);
            if (!api) {
              throw new Error(`No method found for ${kind}`);
            }

            const methodName = this.getMethodName("patch", kind);

            const result = await api[methodName](namespace, obj);

            return result;
          })
        );
      },
      exists: async (namespace: string) => {
        try {
          await this.k8Core.readNamespace(namespace);

          return true;
        } catch {
          return false;
        }
      },
      create: async (namespace: string) => {
        try {
          await this.k8Core.createNamespace({ metadata: { name: namespace } });
        } catch (err) {
          this.logger.error(err);
          throw new Error("Failed to create namespace");
        }
      },
      delete: (namespace: string) => {
        try {
          return this.k8Core.deleteNamespace(namespace);
        } catch (err) {
          this.logger.error(err);
          throw new Error("Failed to delete namespace");
        }
      },
    };
  }
}
