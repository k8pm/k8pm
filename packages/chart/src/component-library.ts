import type { Chart } from "cdk8s";
import type {
  Container,
  KubeDeploymentProps,
  KubeServiceProps,
  KubeStatefulSetProps,
  ServicePort,
} from "k8s-types";
import {
  IntOrString,
  KubeDeployment,
  KubeService,
  KubeStatefulSet,
} from "k8s-types";
import type { LoggerInstance } from "logger";
import { Logger } from "logger";
import type { ChartContext } from "./chart";

const createProps = (
  props: {
    name: string;
    app: string;
    replicas?: number;
    initContainers?: Container[];
    containers: Container[];
  },
  context: ChartContext
) => ({
  metadata: {
    name: props.name,
    namespace: context.namespace,
    labels: {
      app: props.app,
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        service: props.name,
      },
    },
    template: {
      metadata: {
        labels: {
          service: props.name,
        },
      },
      spec: {
        initContainers: props.initContainers,
        containers: props.containers,
      },
    },
  },
});

/**
 * Abstraction for creating Kubernetes components with less repetative bullshit.
 * Components from the library are designed to work well together.
 */
export class ComponentLibrary {
  logger: LoggerInstance;
  constructor(private readonly chart: Chart) {
    this.logger = new Logger().createLogger("component-library");
  }
  get util() {
    return {
      intOrStringFromNumber: (value: number) => IntOrString.fromNumber(value),
      intOrStringFromString: (value: string) => IntOrString.fromString(value),
    };
  }

  service(
    props: { name: string; targetApp: string; ports: ServicePort[] },
    context: ChartContext
  ) {
    const serviceProps: KubeServiceProps = {
      metadata: {
        name: props.name,
        namespace: context.namespace,
      },
      spec: {
        selector: {
          app: props.targetApp,
        },
        ports: props.ports,
      },
    };
    this.logger.debug("Service", serviceProps);
    return new KubeService(this.chart, props.name, serviceProps);
  }
  deployment(
    props: {
      name: string;
      app: string;
      replicas?: number;
      initContainers?: Container[];
      containers: Container[];
    },
    context: ChartContext
  ) {
    const deploymentProps: KubeDeploymentProps = createProps(props, context);

    this.logger.debug("Deployment", deploymentProps);

    return new KubeDeployment(this.chart, props.name, deploymentProps);
  }
  statefulSet(
    props: {
      name: string;
      app: string;
      replicas?: number;
      initContainers?: Container[];
      containers: Container[];
    },
    context: ChartContext
  ) {
    const defaultProps = createProps(props, context);

    const statefulSetProps: KubeStatefulSetProps = {
      ...defaultProps,
      spec: {
        ...defaultProps.spec,
        serviceName: props.name,
      },
    };

    this.logger.debug("StatefulSet", statefulSetProps);

    return new KubeStatefulSet(this.chart, props.name, statefulSetProps);
  }
}
