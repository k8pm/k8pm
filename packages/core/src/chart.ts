import type { ApiObject } from "cdk8s";
import { App as Cdk8sApp, Chart as Cdk8sChart } from "cdk8s";
import { Logger } from "logger";
import type { z } from "zod";

// type Constructable<T> = new (...args: any[]) => T;

export type ChartValues = Record<string, any>;

export interface ChartContext {
  namespace: string;
}

// export interface Component<T> {
//   apiObject: Constructable<ApiObject>;
//   new (values: T, context: ChartContext): ApiObject;
// }

export type ComponentFactory<T> = (
  values: T,
  context: ChartContext,
  chart: Cdk8sChart
) => ApiObject;

// interface ChartState {
//   _components: ComponentFactory<any>[];
//   _schema?: z.Schema;
// }

// export interface ChartInterface<T> extends ChartState {
//   setSchema: (schema: z.Schema) => void;
//   setValues: (values: T) => void;
//   addComponent: (func: ComponentFactory<T>) => void;
//   renderToYAML: () => string;
//   renderToJSON: () => JSON;
//   renderToAPIObjects: () => ApiObject[];
// }

export class Chart<T> {
  private _components: ComponentFactory<any>[] = [];
  private _schema?: z.Schema = undefined;
  private _values: T = {} as T;
  private _context: ChartContext = {
    namespace: "default",
  };
  private logger = new Logger().createLogger("chart");
  private parseValues(values: T) {
    return this._schema?.safeParseAsync(values);
  }
  addComponent(func: ComponentFactory<T>) {
    this._components.push(func);
  }
  schema(schema: z.ZodType<any, z.ZodTypeDef, any>) {
    this._schema = schema;
  }
  values(values: T) {
    this._values = values;
  }
  async renderToYAML(
    name: string,
    values: Record<string, any>,
    context: ChartContext
  ) {
    const app = new Cdk8sApp();
    const chart = new Cdk8sChart(app, this.constructor.name);

    const parsedValues = (await this.parseValues({
      ...this._values,
      ...values,
    })) as {
      data: T;
    };

    this.logger.info("Parsed values", parsedValues.data);
    this._values = parsedValues.data;

    this._components.forEach((componentFunc) => {
      componentFunc(this._values, context, chart);
    });

    return app.synthYaml();
  }
}
