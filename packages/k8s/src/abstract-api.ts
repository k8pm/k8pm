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

export class AbstractApi {
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

    // The above method is not foolproof
    // we need to manually specify which API to use for some kinds
    // of components
    ["Namespace"].forEach((kind) => {
      this.apiHandlerMapping[kind] = this.k8Core;
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

  getMethodName(action: AbstractApiMethodNames, kind: string) {
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
}
