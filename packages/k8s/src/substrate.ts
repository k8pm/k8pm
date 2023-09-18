import type { V1Secret } from "@kubernetes/client-node";
import type { ApiObject } from "cdk8s";
import yaml from "js-yaml";
import type { LoggerInstance } from "logger";
import { Logger } from "logger";
import type { K8sClient } from "./k8s";

export enum ReleaseStatus {
  DEPLOYED = "deployed",
  DELETED = "deleted",
  SUPERSEDED = "superseded",
  FAILED = "failed",
}

export interface ReleaseMetaArgs {
  manifestName: string;
  deployedAt: number;
  version: string;
  release: number;
  namespace: string;
  status?: ReleaseStatus;
}

export class Release {
  manifestName: string;
  deployedAt: number;
  version: string;
  release: number;
  namespace: string;
  resources: string[] = [];
  status?: ReleaseStatus;

  constructor(args: ReleaseMetaArgs) {
    this.manifestName = args.manifestName;
    this.deployedAt = args.deployedAt;
    this.version = args.version;
    this.release = args.release;
    this.namespace = args.namespace;
    this.status = args.status;
  }

  addResource(name: string) {
    this.resources.push(name);
  }

  tag() {
    return `fr8.${this.manifestName}.v${this.version}-${this.release}`;
  }

  labels() {
    return {
      manifestName: this.manifestName,
      version: this.version,
      release: this.release.toString(),
      namespace: this.namespace,
      deployedAt: this.deployedAt.toString(),
      status: this.status || ReleaseStatus.DEPLOYED,
    };
  }
}

/**
 * The substrate manages the state of manifests in the cluster by using secrets.
 * It's the layer between the cluster and the fr8s CLI.
 */
export class Substrate {
  logger: LoggerInstance;
  constructor(private readonly k8sApi: K8sClient) {
    this.logger = new Logger().createLogger("substrate");
  }

  async getAllReleases(namespace: string) {
    const secrets = await this.k8sApi.secret.list(namespace);

    this.logger.debug("Secrets", { items: secrets.body.items });

    try {
      // get all fr8 related secrets
      const releaseSecrets = await Promise.all(
        secrets.body.items
          .filter(
            (secret: V1Secret) =>
              secret.metadata?.name && secret.metadata.name.startsWith("fr8.")
          )
          .map((secret: V1Secret) =>
            this.k8sApi.secret.get(secret.metadata?.name || "", namespace)
          )
      );

      // parse the secrets to Release objects
      const releases = releaseSecrets.map(({ body }) => {
        const { metadata } = body;

        this.logger.debug("Secret result", body);

        // this will be yaml
        const manifestFromBuffer = Buffer.from(
          body.data?.manifest || "",
          "base64"
        ).toString();

        const manifest = yaml.loadAll(manifestFromBuffer) as ApiObject[];

        this.logger.debug("Manifest from buffer", { manifest });

        const meta = new Release({
          manifestName: metadata?.labels?.manifestName || "",
          namespace: metadata?.labels?.namespace || "",
          release: parseInt(metadata?.labels?.release || "0"),
          version: metadata?.labels?.version || "",
          deployedAt: parseInt(metadata?.labels?.deployedAt || "0"),
          status: metadata?.labels?.status as ReleaseStatus,
        });

        return { manifest, meta, tag: meta.tag() };
      });

      this.logger.debug("Releases", { releases });

      return releases;
    } catch (err) {
      this.logger.error("Error getting all releases", err);
      return [];
    }
  }

  async getRelease(manifestName: string, namespace: string) {
    const releases = await this.getAllReleases(namespace);
    const release = releases.find(
      ({ meta }) => meta.manifestName === manifestName
    );

    this.logger.info("Found release", { release });

    return release;
  }

  async create(manifestName: string, namespace: string, yaml: string) {
    const meta = new Release({
      manifestName,
      namespace,
      release: 1,
      version: "0.1.0", // @todo: get version from package.json
      deployedAt: Date.now(),
      status: ReleaseStatus.DEPLOYED,
    });

    this.logger.debug("Creating substrate", { namespace, manifestName });

    await this.k8sApi.secret.create(
      namespace,
      meta.tag(),
      { manifest: yaml },
      meta.labels()
    );
  }

  async update(
    manifestName: string,
    namespace: string,
    version: string,
    status: ReleaseStatus,
    yaml: string
  ) {
    const release = await this.getRelease(manifestName, namespace);

    if (!release) {
      throw new Error(
        `No manifest "${manifestName}" is installed in namespace "${namespace}"`
      );
    }

    const meta = new Release({
      manifestName,
      namespace,
      release: release.meta.release + 1,
      version,
      deployedAt: Date.now(),
      status,
    });

    await this.k8sApi.secret.createReleaseSecret(
      namespace,
      meta.tag(),
      yaml,
      meta.labels()
    );
  }

  async deleteAll(namespace: string, manifestName: string) {
    const manifests = await this.getAllReleases(namespace);
    this.logger.debug("Deleting all manifests in namespace", {
      namespace,
      manifests,
    });

    const filtered = manifests.filter(
      ({ meta }) => meta.manifestName !== manifestName
    );

    await Promise.all(
      filtered.map(async ({ meta }) =>
        this.delete(namespace, meta.manifestName)
      )
    );
  }

  async delete(namespace: string, manifestName: string) {
    const manifest = await this.getRelease(manifestName, namespace);

    if (!manifest?.meta) {
      throw new Error(
        `No manifest "${manifestName}" is installed in namespace "${namespace}"`
      );
    }

    await this.k8sApi.secret.delete(namespace, manifest.tag);
  }
}
