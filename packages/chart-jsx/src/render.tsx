import React from "react";
import { renderToString } from "react-dom/server";
import { MyChart } from "./my-chart";

export const renderChart = () =>
  renderToString((<MyChart />) as React.ReactElement);
