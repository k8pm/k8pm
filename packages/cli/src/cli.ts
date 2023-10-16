import { LoggerInstance } from "@k8pm/logger";
import { AppContainer, AppInject, AppService } from "./ioc";
import type { CommandHandlerInterface, CLIInterface } from "./types";
import { constantDependencies } from "./constants";

@AppService()
export class CLI implements CLIInterface {
  argv?: string[];
  command?: string;

  constructor(
    @AppInject(constantDependencies.logger) private logger: LoggerInstance
  ) {}

  parseArgs(args: string[]) {
    this.argv = args;
    this.command = args[0];
  }

  execute() {
    if (!this.command) {
      throw new Error("No command provided");
    }

    this.logger.debug("Executing command", { command: this.command });
    this.logger.debug("Arguments", { args: this.argv });

    try {
      const handler = AppContainer.get<CommandHandlerInterface | undefined>(
        `ICommandHandler:${this.command}`
      );

      if (handler) {
        handler.action(this.argv?.slice(1));
      } else {
        throw new Error(`No handler found for command ${this.command}`);
      }
    } catch (e) {
      this.logger.error("Error executing command");
      this.logger.error(e);
    }
  }
}
