import { AppService } from "@fr8/core";
import arg from "arg";
import type { ICommandHandler } from "../types";

const command = "install";

@AppService(`ICommandHandler:${command}`)
@AppService()
export class InstallHandler implements ICommandHandler {
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

  action(args?: string[]) {
    if (args?.length !== 2) {
      throw new Error("Invalid args");
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

    console.log("Installing chart", releaseName, chartPath, options);
  }
}
