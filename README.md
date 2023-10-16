# k8pm

A Kubernetes package manager for TypeScript.

**Features:**

- Define Kubernetes infra without touching YAML.
- Supports Zod schemas for parsing values.
- Programatically manage packages.
- Helm-like CLI.

### This project is currently in ALPHA and is not recommended for production. USE AT YOUR OWN RISK

## Setup

First install the `k8pm` CLI:

```bash
# Globally
npm i -g @k8pm/cli

# Locally
npm i -D @k8pm/cli
```

Then within your project install the packages required to build charts.

```bash
npm i @k8pm/core @k8pm/components
```

## Usage

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

Install the chart using the `k8pm` command:

```bash
k8pm install my-release ./chart.ts -n my-namespace

k8pm uninstall my-release -n my-namespace
```

**Note:** The `kpm` command is an alias of `k8pm` and can be used for convenience.

You can also manage your charts programatically:

```javascript
import chart from "./chart";

const manager = new FreightManager();

await manager.install("my-release", chart);
await manager.uninstall("my-release");
```

# Roadmap

| Feature                 | Status |
| ----------------------- | ------ |
| Install                 | ✅     |
| Uninstall               | ✅     |
| List installed packages | ✅     |
| Upgrade                 | TODO   |
| Rollback                | TODO   |
| CRD handling            | TODO   |
| Additional components   | TODO   |

# Q/A

### What does K8PM stand for?

K8PM stands for K8PM. It does **not** stand for Kubernetes Package Manager, as that would make use of a Linux Foundation trademark for "Kubernetes".

### Is this just a wrapper around Helm?

Nope. Helm is not a dependency. We use the Kubernetes API directly.

### Is this a replacement for Helm?

That is the goal.

### Why?

Life is too short to spend it writing YAML.
