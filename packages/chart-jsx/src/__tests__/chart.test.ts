import React from "react";
import { renderToString } from "react-dom/server";
import { MyChart } from "../my-chart";

describe("transformer", () => {
  it("should transform", () => {
    const result = renderToString(<MyChart />);

    expect(result).toEqual("");
  });
});
