import arg from "arg";
import { FreightManager } from "@fr8/core";
import { LoggerInstance } from "@fr8/logger";
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
    if (args?.length !== 2) {
      throw new Error("Invalid args");
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
