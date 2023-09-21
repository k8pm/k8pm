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
  context: ChartContext,
  chart: Cdk8sChart
) => ApiObject;

export class Chart<T> {
  private _components: Component<any>[] = [];
  private _schema?: z.Schema = undefined;
  private _values: T = {} as T;

  private logger = new Logger().createLogger("chart");
  private parseValues(values: T) {
    return this._schema?.safeParseAsync(values);
  }
  addComponent(component: Component<T>) {
    this._components.push(component);
  }
  schema(schema: z.ZodType<any, z.ZodTypeDef, any>) {
    this._schema = schema;
  }
  values(values: T) {
    this._values = values;
  }
  async render(
    name: string,
    values: Record<string, any>,
    context: ChartContext
  ) {
    const app = new Cdk8sApp();
    const chart = new Cdk8sChart(app, name);

    const parsedValues = (await this.parseValues({
      ...this._values,
      ...values,
    })) as {
      data: T;
    };

    this.logger.info("Parsed values", parsedValues.data);
    this._values = parsedValues.data;

    this._components.forEach((ComponentInstance: Component<any>) => {
      ComponentInstance.createComponent(chart, this._values, context);
    });

    return app.synthYaml();
  }
}
