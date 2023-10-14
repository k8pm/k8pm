import path from "node:path";
import { cwd } from "node:process";
import type { LoggerInstance } from "@fr8/logger";
import { Logger } from "@fr8/logger";
import { Substrate } from "@fr8/substrate";
import { AbstractApi, AbstractApiMethodNames, NamespaceApi } from "@fr8/k8s";
import type { Chart } from "./chart";
import { apply } from "./apply";

const DEFAULT_VERSION = "0.0.1";

interface InstallOptions {
  createNamespace?: boolean;
  releaseName?: string;
  version?: string;
}

interface UpgradeOptions extends InstallOptions {
  install?: boolean;
}

export class FreightManager {
  namespace: string;
  releaseApi: Substrate;
  namespaceApi: NamespaceApi<any>;
  abstractApi: AbstractApi;
  logger: LoggerInstance;

  constructor(namespace?: string) {
    this.namespace = namespace || "default";
    this.logger = new Logger().createLogger("manager");
    this.releaseApi = new Substrate(namespace || "default");
    this.namespaceApi = new NamespaceApi(namespace || "default");
    this.abstractApi = new AbstractApi();
  }

  async _importChart(importPath: string) {
    const pathToChart = path.resolve(importPath);
    const module = await import(pathToChart);
    return module.chart as Chart<any>;
  }

  /**
   * Based on common install options determine whether to create a new namespace,
   * use an existing namespace, or throw an error.
   */
  async _handleNamespace(namespace: string, opts?: InstallOptions) {
    try {
      await this.namespaceApi.get();
      this.logger.debug("Using existing namespace", { namespace });
    } catch (err) {
      if (!opts?.createNamespace) {
        throw new Error("Namespace doesn't exist");
      } else {
        this.logger.info("Creating namespace", { namespace });
        await this.namespaceApi.create();
      }
    }
  }
  async install(
    chartName: string,
    releaseName: string,
    yaml: string,
    values: Record<string, any>,
    opts?: InstallOptions
  ) {
    this.logger.info("Installing chart from file", {
      chartName,
      yaml,
      values,
    });

    await this._handleNamespace(this.namespace, opts);

    const chartInstalled = await this.releaseApi.exists(chartName);

    if (chartInstalled) {
      throw new Error(
        `"${chartName}" is already installed in ${this.namespace}`
      );
    }

    try {
      this.logger.info(`Applying ${chartName}`);
      await apply(yaml, AbstractApiMethodNames.CREATE);
      const release = await this.releaseApi.install(
        chartName,
        releaseName,
        opts?.version || DEFAULT_VERSION,
        yaml
      );
      this.logger.info("Release installed", { release });
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
    releaseName: string,
    chartPath: string,
    values: Record<string, any>,
    opts?: InstallOptions
  ) {
    this.logger.info("Installing manifest from file", {
      chartPath,
      releaseName,
      values,
    });

    const manifest = await this._importChart(chartPath);
    const yaml = await manifest.render(releaseName, values, {
      namespace: this.namespace,
    });

    const chartName = chartPath.split("/").pop()?.split(".").shift();

    if (!chartName) {
      throw new Error("Could not determine chart name");
    }
    if (!yaml) {
      throw new Error("Could not render chart");
    }
    await this.install(chartName, releaseName, yaml, values, opts);
  }

  async uninstall(chartName: string, opts?: { namespace?: string }) {
    const namespace = opts?.namespace || "default";
    this.logger.info("Uninstalling chart", {
      chartName,
    });

    const exists = await this.releaseApi.exists(chartName);

    if (!exists) {
      throw new Error(`"${chartName}" is not installed in "${namespace}"`);
    }
    const release = await this.releaseApi.get(chartName);

    try {
      this.logger.info(`Deleting ${chartName}`);
      // @todo: only delete the chart resources
      await apply(release?.yml || "", AbstractApiMethodNames.DELETE);
      await this.releaseApi.uninstall(chartName);
    } catch (err) {
      this.logger.error("Uninstall error", err);
    }
  }

  // async list(opts?: { namespace?: string }) {
  //   throw new Error("not implemented");
  // }

  async upgrade(
    releaseName: string,
    chartName: string,
    yaml: string,
    values: Record<string, any>,
    opts?: UpgradeOptions
  ) {
    this.logger.info("Upgrading manifest from file", {
      chartName,
      yaml,
      values,
    });

    const existing = await this.releaseApi.exists(releaseName);

    if (!existing && !opts?.install) {
      throw new Error(`"${chartName}" is not installed in "${this.namespace}"`);
    }

    await this._handleNamespace(this.namespace, opts);

    try {
      this.logger.info(`Upgrading ${chartName}`);
      await apply(yaml, AbstractApiMethodNames.PATCH);
      await this.releaseApi.upgrade(
        releaseName,
        yaml,
        opts?.version || DEFAULT_VERSION
      );
    } catch (err) {
      this.logger.error("Upgrade error", err);
    }
  }
}
