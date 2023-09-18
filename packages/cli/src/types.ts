export interface Option {
  name: string;
  description: string;
  defaultValue?: string;
}

export interface Arg {
  name: string;
  description: string;
}

export interface ICommandHandler {
  name: string;
  description: string;
  args: Arg[];
  action: (args?: string[]) => void;
}
