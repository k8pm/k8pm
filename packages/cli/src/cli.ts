import { AppContainer, AppService } from "@fr8/core";
import type { ICommandHandler } from "./types";

@AppService()
export class CthuluCli {
  argv?: string[];
  command?: string;

  parseArgs(args: string[]) {
    this.argv = args;
    this.command = args[0];
  }

  execute() {
    console.log("Executing CthuluCli");
    console.log("Args:", this.argv);
    console.log("Command:", this.command);
    const handler = AppContainer.get<ICommandHandler | undefined>(
      `ICommandHandler:${this.command}`
    );

    if (handler) {
      handler.action(this.argv?.slice(1));
    } else {
      throw new Error(`No handler found for command ${this.command}`);
    }
  }
}
