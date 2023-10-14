import { IntOrString } from "@fr8/k8s-types";

export const intOrStringFromNumber = (value: number) =>
  IntOrString.fromNumber(value);
export const intOrStringFromString = (value: string) =>
  IntOrString.fromString(value);
