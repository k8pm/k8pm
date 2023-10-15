import { App as Cdk8sApp, Chart as Cdk8sChart } from "cdk8s";
import { Logger } from "@fr8/logger";
import type { z } from "zod";
import type { Component } from "@fr8/components";

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
  // The version is used when installing/upgrading the chart,
  // not when rendering components (unless you want to use it for that too).
  private version = "0.0.1";
  private components: ComponentFactory<any>[] = [];
  private schema?: z.Schema = undefined;
  private values: T = {} as T;
  private logger = new Logger().createLogger("chart");

  constructor(public readonly name: string) {}

  private parseValues(values: T) {
    return this.schema?.safeParseAsync(values);
  }
  addComponent(factory: ComponentFactory<T>) {
    this.components.push(factory);
  }

  /**
   * Set the schema for validating the values used when rendering the chart.
   * @param schema - Zod schema
   */
  setSchema(schema: z.ZodType<any, z.ZodTypeDef, any>) {
    this.schema = schema;
  }

  /**
   * Set the default values for the chart.
   * @param values - Default values
   */
  setValues(values: T) {
    this.values = {
      ...this.values,
      ...values,
    };
  }

  /**
   * Set the version of the chart.
   * @param version - Chart version
   */
  setVersion(version: string) {
    this.version = version;
  }

  /**
   * Render the chart.
   * @param name - Name of the chart
   * @param values - Values to use when rendering the chart
   * @param context - Chart context
   */
  async render(name: string, values: Partial<T>, context: ChartContext) {
    const app = new Cdk8sApp();
    const chart = new Cdk8sChart(app, name);

    const combinedValues = {
      ...this.values,
      ...values,
    };

    const currentValues = this.schema
      ? ((await this.parseValues(combinedValues)) as T)
      : combinedValues;

    this.logger.info("Values:", currentValues);
    this.values = currentValues;

    this.components.forEach((factory: ComponentFactory<any>) => {
      const component = factory(currentValues, context);
      return component.createComponent(chart);
    });

    return app.synthYaml();
  }
}
