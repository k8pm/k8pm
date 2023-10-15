import type { LoggerInstance } from "@fr8/logger";
import { Logger } from "@fr8/logger";
import { KubeConfig, CoreV1Api, AppsV1Api } from "@kubernetes/client-node";

export enum AbstractApiMethodNames {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  PATCH = "patch",
}

type ApiMethodMapping = Record<AbstractApiMethodNames, any>;

/**
 * AbstractApi is a wrapper around the k8s client that provides
 * an interface for calling the appropriate k8s API method based
 * on the kind of component being managed and the action being performed.
 */
export class AbstractApi {
  logger: LoggerInstance;
  kc = new KubeConfig();
  k8Core: CoreV1Api;
  k8Apps: AppsV1Api;
  apiHandlerMapping: Record<string, ApiMethodMapping> = {};

  constructor() {
    this.logger = new Logger().createLogger("k8s");
    this.kc.loadFromDefault();
    this.k8Core = this.kc.makeApiClient(CoreV1Api);
    this.k8Apps = this.kc.makeApiClient(AppsV1Api);

    // Iterate through the methods exposed by the k8s client
    // and compile a mapping of k8s API methods to the appropriate
    // k8s client API handler.
    [this.k8Core, this.k8Apps].forEach((api) => {
      Object.getOwnPropertyNames(Object.getPrototypeOf(api)).forEach((key) => {
        // @todo: refactor this to iterate through the AbstractApiMethodNames enum
        if (key.match(/createNamespaced(.*)/g)) {
          const kind = key.replace("createNamespaced", "");
          this.apiHandlerMapping[kind] = {
            ...this.apiHandlerMapping[kind],
            [AbstractApiMethodNames.CREATE]: api,
          };
        }

        if (key.match(/deleteNamespaced(.*)/g)) {
          const kind = key.replace("deleteNamespaced", "");
          this.apiHandlerMapping[kind] = {
            ...this.apiHandlerMapping[kind],
            [AbstractApiMethodNames.DELETE]: api,
          };
        }
      });
    });

    ["Namespace"].forEach((kind) => {
      this.k8Core;
      this.apiHandlerMapping[kind] = {
        ...this.apiHandlerMapping[kind],
        [AbstractApiMethodNames.CREATE]: this.k8Core,
      };
    });
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

  getMethodName(method: AbstractApiMethodNames, kind: string) {
    const methodName = `${method}Namespaced${kind}`;
    return methodName;
  }

  getApi(method: AbstractApiMethodNames, kind: string) {
    const api = this.apiHandlerMapping[kind][method];
    return api;
  }
}
