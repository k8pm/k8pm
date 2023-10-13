import { SecretsApi } from "@fr8/k8s";

export interface ReleaseMeta {
  chartName: string;
  version: string;
  releaseName: string;
  releaseNumber: number;
  createdAt: number;
  updatedAt: number;
  yml: string;
}

export class ReleaseDb {
  secretsDb: SecretsApi<ReleaseMeta>;
  constructor(readonly namespace: string) {
    this.secretsDb = new SecretsApi(namespace);
  }

  generateTag(chartName: string, version: string, release: number) {
    return `fr8.${chartName}.v${version}-${release}`;
  }

  async exists(chartName: string): Promise<boolean> {
    const releases = await this.listReleases();
    return releases.some((r) => r.chartName === chartName);
  }

  async getRelease(releaseName: string) {
    const releases = await this.secretsDb.list(this.namespace);
    const release = releases.body.items.find(
      (item) => item.metadata?.name === releaseName
    );

    if (!release?.stringData?.data) {
      return null;
    }

    // lol typescript
    return release.stringData.stringData as any as ReleaseMeta;
  }
  async createRelease(data: ReleaseMeta): Promise<string> {
    const tag = this.generateTag(
      data.chartName,
      data.version,
      data.releaseNumber
    );
    await this.secretsDb.create(
      tag,
      // release data
      data,
      // labels
      {
        service: "fr8",
      }
    );

    return tag;
  }
  async updateRelease(name: string, meta: ReleaseMeta) {
    const release = await this.getRelease(name);
    if (!release) {
      throw new Error("Release not found");
    }
    await this.secretsDb.update(name, meta);
  }
  async deleteRelease(name: string): Promise<void> {
    await this.secretsDb.delete(name);
  }
  async listReleases() {
    const releases = await this.secretsDb.list(this.namespace);
    return releases.body.items
      .filter((item) => item.metadata?.labels?.service === "fr8")
      .map((item) => JSON.parse(item.stringData?.data || "") as ReleaseMeta);
  }
}
