import arg from "arg";
import { FreightManager } from "@fr8/core";
import { LoggerInstance } from "@fr8/logger";
import { AppInject, AppService } from "../ioc";
import type { CommandHandlerInterface } from "../types";
import { constantDependencies } from "../constants";

const command = "install";

@AppService(`ICommandHandler:${command}`)
@AppService()
export class InstallHandler implements CommandHandlerInterface {
  name = command;
  description = "Installs a package";
  args = [
    {
      name: "releaseName",
      description: "The name for the release",
    },
    {
      name: "chartPath",
      description: "Path to the chart",
    },
  ];
  constructor(
    @AppInject(constantDependencies.logger) private logger: LoggerInstance
  ) {}

  async action(args?: string[]) {
    if (!args) {
      throw new Error("No arguments provided");
    }
    const [releaseName, chartPath] = args;

    const options = arg({
      // Types
      "--namespace": String,
      "--createNamespace": Boolean,
      "--set": [String], // --set <string> or --set=<string>

      // Aliases
      "-n": "--namespace",
      "-s": "--set",
    });

    const namespace = options["--namespace"];
    const manager = new FreightManager(namespace);

    const values = options["--set"]?.reduce((acc, curr) => {
      const [key, value] = curr.split("=");
      return {
        ...acc,
        [key]: value,
      };
    }, {});

    await manager.installFromFile(releaseName, chartPath, values || {}, {
      createNamespace: options["--createNamespace"],
    });

    this.logger.info(`Installed "${releaseName}" from "${chartPath}"`);
  }
}
