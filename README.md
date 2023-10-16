# KPM

A Kubernetes package manager for TypeScript.

**!!! This project is currently in ALPHA and is not recommended for production use !!!**

## Usage

Write your charts in Typescript:

```javascript
// chart.ts
const chart = new Chart() < { service: string } > "my-chart";

const serviceName = "my-service";
const namespace = "my-namespace";

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
```

And install your chart using the `kpm` CLI:

```bash
kpm install my-release ./chart.ts --namespace my-namespace
```

You can also manage your charts programatically:

```javascript
import chart from "./chart";

const manager = new FreightManager();

await manager.install("my-release", chart);
await manager.uninstall("my-release");
```

# Q/A

### What does KPM stand for?

KPM stands for KPM. It does **not** stand for Kubernetes Package Manager, as that would make use of a Linux Foundation trademark for "Kubernetes".

### Is this just a wrapper around Helm?

Nope. Helm is not a dependency. We use the Kubernetes API directly.

### Is this a replacement for Helm?

That is the goal.

### Why?

Life is too short to spend it writing YAML.
