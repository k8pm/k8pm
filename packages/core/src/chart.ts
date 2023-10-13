import type { ApiObject } from "cdk8s";
import { App as Cdk8sApp, Chart as Cdk8sChart } from "cdk8s";
import { Logger } from "@fr8/logger";
import type { z } from "zod";
import type { Component } from "./components";

// type Constructable<T> = new (...args: any[]) => T;

export type ChartValues = Record<string, any>;

export interface ChartContext {
  namespace: string;
}

export type ComponentFactory<T> = (
  values: T,
  context: ChartContext
) => Component<any>;

export class Chart<T> {
  private _version: string = "0.0.1";
  private _components: ComponentFactory<any>[] = [];
  private _schema?: z.Schema = undefined;
  private _values: T = {} as T;
  private logger = new Logger().createLogger("chart");

  private parseValues(values: T) {
    return this._schema?.safeParseAsync(values);
  }
  addComponent(factory: ComponentFactory<T>) {
    this._components.push(factory);
  }
  schema(schema: z.ZodType<any, z.ZodTypeDef, any>) {
    this._schema = schema;
  }
  values(values: T) {
    this._values = {
      ...this._values,
      ...values,
    };
  }
  version(version: string) {
    this._version = version;
  }

  async render(name: string, values: Partial<T>, context: ChartContext) {
    const app = new Cdk8sApp();
    const chart = new Cdk8sChart(app, name);

    const combinedValues = {
      ...this._values,
      ...values,
    };

    const currentValues = this._schema
      ? ((await this.parseValues(combinedValues)) as T)
      : combinedValues;

    this.logger.info("Values:", currentValues);
    this._values = currentValues;

    this._components.forEach((factory: ComponentFactory<any>) => {
      const component = factory(currentValues, context);
      return component.createComponent(chart);
    });

    return app.synthYaml();
  }
}
