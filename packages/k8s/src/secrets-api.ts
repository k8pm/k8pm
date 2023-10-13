import { KubernetesApiWrapper } from "./library/api";

export class SecretsApi<T> extends KubernetesApiWrapper<T> {
  async create(name: string, data: any, labels: Record<string, string>) {
    return this.k8Core.createNamespacedSecret(this.namespace, {
      metadata: {
        name,
        labels,
      },
      stringData: {
        data: JSON.stringify(data),
      },
    });
  }
  async get(name: string) {
    return this.k8Core.readNamespacedSecret(name, this.namespace);
  }
  async delete(name: string) {
    return this.k8Core.deleteNamespacedSecret(name, this.namespace);
  }
  async list(namespace: string) {
    // @todo: filter by label
    return this.k8Core.listNamespacedSecret(namespace);
  }
  async update(name: string, data: T) {
    const resp = await this.k8Core.readNamespacedSecret(name, this.namespace);
    if (!resp.body.stringData) {
      throw new Error("No metadata found");
    }
    return this.k8Core.patchNamespacedSecret(name, this.namespace, {
      stringData: {
        data: JSON.stringify(data),
      },
    });
  }
}
