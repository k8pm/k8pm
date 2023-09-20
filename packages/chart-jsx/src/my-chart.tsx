import React from "react";
import { Chart } from "./components/Chart";
import { Service } from "./components/Service";

export const MyChart: React.FunctionComponent = () => {
  return (
    <Chart name="my-chart">
      <Service
        name="BTC"
        spec={{
          metadata: {
            name: "BTC",
          },
        }}
      />
    </Chart>
  );
};
