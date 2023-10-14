export interface CLIInterface {
  argv?: string[];
  command?: string;
  parseArgs: (args: string[]) => void;
  execute: () => void;
}
export interface Option {
  name: string;
  description: string;
  defaultValue?: string;
}

export interface Arg {
  name: string;
  description: string;
}

export interface CommandHandlerInterface {
  name: string;
  description: string;
  args: Arg[];
  action: (args?: string[]) => void;
}
