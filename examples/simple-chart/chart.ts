import { Chart } from "@fr8/core";
import { Service, StatefulSet } from "@fr8/components";

interface ChartValues {
  service: string;
}

export const chart = new Chart<ChartValues>("my-chart");

const serviceName = "my-service";

// Default values
chart.setValues({
  service: serviceName,
});

// Service
chart.addComponent(
  (values, context) =>
    new Service({
      metadata: {
        name: serviceName,
        namespace: context.namespace,
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

// Stateful Set
chart.addComponent(
  (values, context) =>
    new StatefulSet({
      metadata: {
        name: serviceName,
        namespace: context.namespace,
        labels: {
          service: values.service,
          namespace: context.namespace,
        },
      },
      spec: {
        serviceName,
        selector: {
          matchLabels: {
            service: serviceName,
          },
        },
        replicas: 1,
        template: {
          metadata: {
            labels: {
              service: serviceName,
            },
          },
          spec: {
            containers: [
              {
                name: serviceName,
                image: "nginx:latest",
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
