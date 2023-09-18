import { Chart } from 'cdk8s';
import {
  Container,
  IntOrString,
  KubeDeployment,
  KubeDeploymentProps,
  KubeService,
  KubeServiceProps,
  KubeStatefulSet,
  KubeStatefulSetProps,
  ServicePort,
} from '../imports/k8s';
import { ChartContext } from './chart';
import { createLogger } from '../library/logger';

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
  loggers = createLogger('component-library');
  constructor(private readonly chart: Chart) {}
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
    this.loggers.debug('Service', serviceProps);
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

    this.loggers.debug('Deployment', deploymentProps);

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

    this.loggers.debug('StatefulSet', statefulSetProps);

    return new KubeStatefulSet(this.chart, props.name, statefulSetProps);
  }
}
