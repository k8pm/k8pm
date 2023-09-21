import type { KubeServiceProps } from "k8s-types";
import { Chart } from "../chart";
import { Service } from "../components";

// jest.mock("logger", () => {
//   return {
//     Logger: mockLogger,
//   };
// });
//const mockParseAsync = jest.fn();
// jest.mock("zod", () => {
//   return {
//     parseAsync: mockParseAsync,
//   };
// });

describe("core", () => {
  it("should work", () => {
    const chart = new Chart();

    chart.addComponent(
      new Service({
        metadata: {
          name: "my-service",
        },
      })
    );

    expect(
      chart.render("my-release", {}, { namespace: "my-namespace" })
    ).toEqual({
      metadata: {
        name: "my-service",
        namespace: "my-namespace",
      },
    } as KubeServiceProps);
  });
});
