import { SecretsApi } from "@k8pm/k8s";

export interface ReleaseMeta {
  tag: string;
  chartName: string;
  version: string;
  releaseName: string;
  releaseNumber: number;
  createdAt: number;
  updatedAt: number;
  yml: string;
}

const KPM_RECORD_PREFIX = "kpm";

export class ReleaseDb {
  secretsDb: SecretsApi<ReleaseMeta>;
  constructor(readonly namespace: string) {
    this.secretsDb = new SecretsApi(namespace);
  }

  generateTag(chartName: string, version: string, release: number) {
    return `${KPM_RECORD_PREFIX}.${chartName}.v${version}-${release}`;
  }

  async exists(releaseName: string): Promise<boolean> {
    const releases = await this.listReleases();
    return releases.some((r) => r.releaseName === releaseName);
  }

  async getRelease(releaseName: string) {
    const releases = await this.listReleases();
    const release = releases.find((r) => r.releaseName === releaseName);
    return release || null;
  }
  async createRelease(data: Omit<ReleaseMeta, "tag">): Promise<string> {
    const tag = this.generateTag(
      data.chartName,
      data.version,
      data.releaseNumber
    );
    await this.secretsDb.create(
      tag,
      // release data
      {
        ...data,
        tag,
      },
      // labels
      {
        service: KPM_RECORD_PREFIX,
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
      .filter(
        (item) =>
          item.metadata?.labels?.service === KPM_RECORD_PREFIX &&
          item.data?.data
      )
      .map((item) => Buffer.from(item.data?.data || "", "base64"))
      .map((buf) => JSON.parse(buf.toString() || "") as ReleaseMeta);
  }
}
