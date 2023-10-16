import arg from "arg";
import { FreightManager } from "@k8pm/core";
import { LoggerInstance } from "@k8pm/logger";
import { AppInject, AppService } from "../ioc";
import type { CommandHandlerInterface } from "../types";
import { constantDependencies } from "../constants";

const command = "uninstall";

@AppService(`ICommandHandler:${command}`)
@AppService()
export class InstallHandler implements CommandHandlerInterface {
  name = command;
  description = "Uninstalls a package";
  args = [
    {
      name: "releaseName",
      description: "The name of the release to uninstall",
    },
  ];

  constructor(
    @AppInject(constantDependencies.logger) private logger: LoggerInstance
  ) {}

  async action(args?: string[]) {
    if (!args) {
      throw new Error("No arguments provided");
    }
    const [releaseName] = args;

    const options = arg({
      // Types
      "--namespace": String,

      // Aliases
      "-n": "--namespace",
    });

    const namespace = options["--namespace"];

    const manager = new FreightManager(namespace);
    await manager.uninstall(releaseName, {
      namespace,
    });

    this.logger.info(`Uninstalled "${releaseName}" from "${namespace}"`);
  }
}
