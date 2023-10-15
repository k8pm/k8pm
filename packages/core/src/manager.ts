import path from "node:path";
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
    const ns = namespace || "default";
    this.namespace = ns;
    this.logger = new Logger().createLogger("manager");
    this.releaseApi = new Substrate(ns);
    this.namespaceApi = new NamespaceApi(ns);
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
    this.logger.debug("Installing chart from file", {
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
      await apply(yaml, AbstractApiMethodNames.CREATE);
      const release = await this.releaseApi.install(
        chartName,
        releaseName,
        opts?.version || DEFAULT_VERSION,
        yaml
      );
      this.logger.info(`Installed "${chartName}" as "${release}"`);
    } catch (err) {
      this.logger.error("Install error", err);
    }
  }

  async installFromModule(
    releaseName: string,
    chart: Chart<any>,
    values: Record<string, any>,
    opts?: InstallOptions
  ) {
    const yaml = await chart.render(chart.name, values, {
      namespace: this.namespace,
    });
    await this.install(chart.name, releaseName, yaml, values, opts);
  }

  async installFromFile(
    releaseName: string,
    chartPath: string,
    values: Record<string, any>,
    opts?: InstallOptions
  ) {
    this.logger.debug("Installing chart from file", {
      chartPath,
      releaseName,
      values,
    });

    const chart = await this._importChart(chartPath);
    const yaml = await chart.render(releaseName, values, {
      namespace: this.namespace,
    });

    const chartName = chart.name;

    if (!chartName) {
      throw new Error("Could not determine chart name");
    }
    if (!yaml) {
      throw new Error("Could not render chart");
    }
    await this.install(chartName, releaseName, yaml, values, opts);
  }

  async uninstall(releaseName: string, opts?: { namespace?: string }) {
    const namespace = opts?.namespace || "default";
    const exists = await this.releaseApi.exists(releaseName);

    if (!exists) {
      throw new Error(`"${releaseName}" is not installed in "${namespace}"`);
    }
    const release = await this.releaseApi.get(releaseName);

    this.logger.debug("Uninstalling chart", {
      releaseName,
      namespace,
    });

    try {
      await apply(release?.yml || "", AbstractApiMethodNames.DELETE);
      await this.releaseApi.uninstall(releaseName);
      this.logger.info(`Deleted ${releaseName}`);
    } catch (err) {
      this.logger.error("Uninstall error", err);
    }
  }

  async upgrade(
    releaseName: string,
    chartName: string,
    yaml: string,
    values: Record<string, any>,
    opts?: UpgradeOptions
  ) {
    const existing = await this.releaseApi.exists(releaseName);

    if (!existing && !opts?.install) {
      throw new Error(
        `"${releaseName}" is not installed in "${this.namespace}"`
      );
    }

    await this._handleNamespace(this.namespace, opts);

    try {
      await apply(yaml, AbstractApiMethodNames.PATCH);
      await this.releaseApi.upgrade(
        releaseName,
        yaml,
        opts?.version || DEFAULT_VERSION
      );
      this.logger.info(`Upgraded ${chartName}`);
    } catch (err) {
      this.logger.error("Upgrade error", err);
    }
  }

  async upgradeFromModule(
    releaseName: string,
    chart: Chart<any>,
    values: Record<string, any>,
    opts?: UpgradeOptions
  ) {
    const yaml = await chart.render(chart.name, values, {
      namespace: this.namespace,
    });
    await this.upgrade(releaseName, chart.name, yaml, values, opts);
  }

  async upgradeFromFile(
    releaseName: string,
    chartPath: string,
    values: Record<string, any>,
    opts?: UpgradeOptions
  ) {
    const chart = await this._importChart(chartPath);
    const yaml = await chart.render(chart.name, values, {
      namespace: this.namespace,
    });
    await this.upgrade(releaseName, chart.name, yaml, values, opts);
  }

  async list() {
    const releases = await this.releaseApi.listReleases();
    return releases;
  }
}
