import React, { createContext } from "react";
import type { Chart as Cdk8sChart } from "cdk8s";

export const ChartContext = createContext<Cdk8sChart | null>(null);

export const useChartContext = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider");
  }
  return context;
};
