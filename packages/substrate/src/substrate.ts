import type { LoggerInstance } from "@fr8/logger";
import { Logger } from "@fr8/logger";
import type { ReleaseMeta } from "./release-db";
import { ReleaseDb } from "./release-db";

export class Substrate {
  logger: LoggerInstance = new Logger().createLogger("substrate");
  db: ReleaseDb;
  constructor(namespace: string) {
    this.db = new ReleaseDb(namespace);
  }
  exists(releaseName: string): Promise<boolean> {
    return this.db.exists(releaseName);
  }
  get(releaseName: string): Promise<ReleaseMeta | null> {
    return this.db.getRelease(releaseName);
  }
  install(
    chartName: string,
    releaseName: string,
    version: string,
    yml: string
  ): Promise<string> {
    const tag = this.db.createRelease({
      chartName,
      releaseName,
      version,
      releaseNumber: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      yml,
    });

    return tag;
  }
  async uninstall(chartName: string): Promise<void> {
    const releases = await this.db.listReleases();
    await Promise.all(
      releases
        .filter((r) => r.chartName === chartName)
        .map((r) => this.db.deleteRelease(r.releaseName))
    );
  }
  rollback() {
    throw new Error("Method not implemented.");
  }
  async upgrade(
    releaseName: string,
    yml: string,
    version?: string
  ): Promise<void> {
    const release = await this.db.getRelease(releaseName);

    if (!release) {
      throw new Error("Release not found");
    }

    await this.db.updateRelease(releaseName, {
      ...release,
      version: version || release.version,
      yml,
      releaseNumber: release.releaseNumber + 1,
      updatedAt: Date.now(),
    });
  }
}
