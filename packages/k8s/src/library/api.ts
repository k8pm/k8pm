/* eslint-disable @typescript-eslint/no-unused-vars -- abstract class  */
import type { LoggerInstance } from "@fr8/logger";
import { Logger } from "@fr8/logger";
import { AppsV1Api, CoreV1Api, KubeConfig } from "@kubernetes/client-node";

export abstract class KubernetesApiWrapper<T> {
  logger: LoggerInstance = new Logger().createLogger("k8s");
  kc = new KubeConfig();
  k8Core: CoreV1Api;
  k8Apps: AppsV1Api;
  constructor(readonly namespace: string) {
    this.kc.loadFromDefault();
    this.k8Core = this.kc.makeApiClient(CoreV1Api);
    this.k8Apps = this.kc.makeApiClient(AppsV1Api);
  }
  create(name: string, data: T, labels: Record<string, any>) {
    throw new Error("method not implemented");
  }
  update(name: string, data: T) {
    throw new Error("method not implemented");
  }
  delete(name: string) {
    throw new Error("method not implemented");
  }
  get(name: string) {
    throw new Error("method not implemented");
  }
}
