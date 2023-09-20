import { useEffect, type FunctionComponent, type ReactNode } from "react";
import { App as Cdk8sApp, Chart as Cdk8sChart } from "cdk8s";
import { ChartContext } from "../context";

export interface ChartProps {
  name: string;
  children?: ReactNode;
}

export const Chart: FunctionComponent<ChartProps> = (props) => {
  const app = new Cdk8sApp();
  const chart = new Cdk8sChart(app, props.name);

  useEffect(() => {
    console.log(app.synthYaml());
  }, [app, chart]);

  return (
    <ChartContext.Provider value={chart}>
      {props.children}
    </ChartContext.Provider>
  );
};
