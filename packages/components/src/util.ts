import { IntOrString } from "@k8pm/k8s-types";

export const intOrStringFromNumber = (value: number) =>
  IntOrString.fromNumber(value);
export const intOrStringFromString = (value: string) =>
  IntOrString.fromString(value);
