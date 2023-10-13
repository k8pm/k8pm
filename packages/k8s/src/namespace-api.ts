import type { V1Namespace } from "@kubernetes/client-node";
import { KubernetesApiWrapper } from "./library/api";

export class NamespaceApi<T> extends KubernetesApiWrapper<T> {
  async create() {
    try {
      await this.k8Core.createNamespace({ metadata: { name: this.namespace } });
    } catch (err) {
      this.logger.error(err);
      throw new Error("Failed to create namespace");
    }
  }
  async get(): Promise<V1Namespace> {
    const resp = await this.k8Core.readNamespace(this.namespace);

    return resp.body;
  }
  async delete() {
    return this.k8Core.deleteNamespace(this.namespace);
  }
}
