import arg from "arg";
import { FreightManager } from "@fr8/core";
import { LoggerInstance } from "@fr8/logger";
import { AppInject, AppService } from "../ioc";
import type { CommandHandlerInterface } from "../types";
import { constantDependencies } from "../constants";

const command = "list";

@AppService(`ICommandHandler:${command}`)
@AppService()
export class InstallHandler implements CommandHandlerInterface {
  name = command;
  description = "List installed packages";
  args = [];
  constructor(
    @AppInject(constantDependencies.logger) private logger: LoggerInstance
  ) {}

  async action() {
    const options = arg({
      // Types
      "--namespace": String,

      // Aliases
      "-n": "--namespace",
    });

    const namespace = options["--namespace"];
    const manager = new FreightManager(namespace);
    const releases = await manager.list();

    this.logger.info(`Packages in ${namespace}:`);

    const data = releases.map((r) => ({
      release: r.releaseName,
      chart: r.chartName,
      version: r.version,
    }));

    console.table(data);
  }
}
