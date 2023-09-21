import path from "node:path";
import type { LoggerInstance } from "@fr8/logger";
import { Logger } from "@fr8/logger";
import { K8sClient, ReleaseStatus, Substrate } from "k8s";
import type { Chart } from "./chart";

interface InstallOptions {
  namespace?: string;
  createNamespace?: boolean;
  releaseName?: string;
}

interface UpgradeOptions extends InstallOptions {
  install?: boolean;
}

export class FreightManager {
  api: K8sClient;
  release: Substrate;
  logger: LoggerInstance;

  constructor() {
    this.logger = new Logger().createLogger("manager");
    this.api = new K8sClient();
    this.release = new Substrate(this.api);
  }

  async _importManifest(importPath: string) {
    const module = await import(path.resolve(importPath));
    const manifest = module.default as Chart<any>;
    return manifest;
  }

  /**
   * Based on common install options determine whether to create a new namespace,
   * use an existing namespace, or throw an error.
   */
  async _handleInstallOptions(namespace: string, opts?: InstallOptions) {
    const existingNamespace = await this.api.namespace.exists(namespace);

    if (!existingNamespace) {
      if (!opts?.createNamespace) {
        throw new Error("Namespace doesn't exist");
      } else {
        this.logger.info("Creating namespace", { namespace });
        await this.api.namespace.create(namespace);
      }
    } else {
      this.logger.debug("Using existing namespace", { namespace });
    }
  }
  async install(
    manifestName: string,
    yaml: string,
    values: Record<string, any>,
    opts?: InstallOptions
  ) {
    const namespace = opts?.namespace || "default";
    this.logger.info("Installing manifest from file", {
      manifestName,
      yaml,
      values,
    });

    const release = await this.release.getRelease(manifestName, namespace);

    if (release) {
      throw new Error(`"${manifestName}" is already installed in ${namespace}`);
    }

    await this._handleInstallOptions(namespace, opts);

    try {
      this.logger.info(`Applying ${manifestName}`);
      await this.api.namespace.install(namespace, yaml);
      await this.release.create(manifestName, namespace, yaml);
    } catch (err) {
      this.logger.error("Install error", err);
    }
  }

  // async installFromModule(
  //   manifestName: string,
  //   manifest: Chart<any>,
  //   values: Record<string, any>,
  //   opts?: InstallOptions
  // ) {
  //   const namespace = opts?.namespace || "default";
  //   const yaml = await manifest.renderToYAML(manifestName, values, {
  //     namespace,
  //   });
  //   await this.install(manifestName, yaml, values, opts);
  // }

  async installFromFile(
    manifestName: string,
    chartPath: string,
    values: Record<string, any>,
    opts?: InstallOptions
  ) {
    const namespace = opts?.namespace || "default";
    this.logger.info("Installing manifest from file", {
      manifestName,
      chartPath,
      values,
    });

    const manifest = await this._importManifest(chartPath);
    const yaml = await manifest.render(manifestName, values, {
      namespace,
    });
    await this.install(manifestName, yaml, values, opts);
  }

  async uninstall(manifestName: string, opts?: { namespace?: string }) {
    const namespace = opts?.namespace || "default";
    this.logger.info("Uninstalling chart", {
      manifestName,
    });

    const release = await this.release.getRelease(manifestName, namespace);

    if (!release) {
      throw new Error(`"${manifestName}" is not installed in "${namespace}"`);
    }

    try {
      this.logger.info(`Deleting ${manifestName}`);
      await this.api.namespace.uninstall(namespace, release.manifest);
      await this.release.delete(namespace, manifestName);
    } catch (err) {
      this.logger.error("Uninstall error", err);
    }
  }

  // async list(opts?: { namespace?: string }) {
  //   throw new Error("not implemented");
  // }

  async upgrade(
    manifestName: string,
    yaml: string,
    values: Record<string, any>,
    opts?: UpgradeOptions
  ) {
    const namespace = opts?.namespace || "default";
    this.logger.info("Upgrading manifest from file", {
      manifestName,
      yaml,
      values,
    });

    const existing = await this.release.getRelease(manifestName, namespace);

    if (!existing && !opts?.install) {
      throw new Error(`"${manifestName}" is not installed in "${namespace}"`);
    }

    await this._handleInstallOptions(namespace, opts);

    try {
      this.logger.info(`Applying ${manifestName}`);
      await this.api.namespace.upgrade(namespace, yaml);
      await this.release.update(
        manifestName,
        namespace,
        "0.1.0", //@todo: get version from chart
        ReleaseStatus.DEPLOYED,
        yaml
      );
    } catch (err) {
      this.logger.error("Install error", err);
    }
  }
}
