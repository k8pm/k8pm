//import type { KubeServiceProps } from "@fr8/k8s-types";
import { StatefulSet } from "cdk8s-plus-25";
import { Chart } from "../chart";
import { Service } from "../components";

//jest.mock("cdk8s");

describe("@fr8/core", () => {
  it("should work", async () => {
    const chart = new Chart<{ service: string }>();

    const serviceName = "my-service";
    const namespace = "my-namespace";

    // set default values
    chart.values({
      service: serviceName,
    });

    chart.addComponent(
      (values, context) =>
        new Service({
          metadata: {
            name: serviceName,
            labels: {
              service: values.service,
              namespace: context.namespace,
            },
          },
          spec: {
            selector: {
              service: serviceName,
            },
            ports: [
              {
                port: 80,
              },
            ],
          },
        })
    );

    const yml = await chart.render("my-release", {}, { namespace });

    expect(yml).toEqual(`apiVersion: v1
kind: Service
metadata:
  labels:
    namespace: my-namespace
    service: my-service
  name: my-service
spec:
  ports:
    - port: 80
  selector:
    service: my-service
`);
  });
});
