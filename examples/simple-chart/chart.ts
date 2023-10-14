import { Chart } from "@fr8/core";
import { Service } from "@fr8/components";

export const chart = new Chart<{ service: string }>();

const serviceName = "my-service";

chart.values({
  service: serviceName,
});

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
