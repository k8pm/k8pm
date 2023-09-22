//import type { KubeServiceProps } from "@fr8/k8s-types";
import { Chart } from "../chart";
import { Service, StatefulSet } from "../components";

//jest.mock("cdk8s");

describe("@fr8/core", () => {
  it("renders chart", async () => {
    const chart = new Chart<{ service: string }>();

    const serviceName = "my-service";
    const namespace = "my-namespace";

    // set default values
    chart.values({
      service: serviceName,
    });

    // add components
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

    chart.addComponent(
      (values, context) =>
        new StatefulSet({
          metadata: {
            name: serviceName,
            labels: {
              service: values.service,
              namespace: context.namespace,
            },
          },
          spec: {
            serviceName: serviceName,
            selector: {
              matchLabels: {
                service: serviceName,
              },
            },
            replicas: 1,
            template: {
              metadata: {
                labels: {
                  service: values.service,
                  namespace: context.namespace,
                },
              },
              spec: {
                containers: [
                  {
                    name: values.service,
                    image: "nginx",
                    ports: [
                      {
                        containerPort: 80,
                      },
                    ],
                  },
                ],
              },
            },
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
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    namespace: my-namespace
    service: my-service
  name: my-service
spec:
  replicas: 1
  selector:
    matchLabels:
      service: my-service
  serviceName: my-service
  template:
    metadata:
      labels:
        namespace: my-namespace
        service: my-service
    spec:
      containers:
        - image: nginx
          name: my-service
          ports:
            - containerPort: 80
`);
  });
});
