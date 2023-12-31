import type { ApiObject, Chart as Cdk8sChart } from "cdk8s";
import type {
  KubeStatefulSetProps,
  KubeServiceProps,
  KubeConfigMapProps,
  KubeDeploymentProps,
} from "@k8pm/k8s-types";
import {
  KubeConfigMap,
  KubeStatefulSet,
  KubeService,
  KubeDeployment,
} from "@k8pm/k8s-types";

export abstract class Component<T> {
  name = "Component";
  args?: T;
  constructor(args: T) {
    this.args = args;
  }
  createComponent(_chart: Cdk8sChart): ApiObject {
    throw new Error("Method not implemented.");
  }
}

export class StatefulSet extends Component<KubeStatefulSetProps> {
  name = "StatefulSet";
  createComponent(chart: Cdk8sChart): ApiObject {
    return new KubeStatefulSet(chart, this.name, this.args);
  }
}

export class Deployment extends Component<KubeDeploymentProps> {
  name = "Deployment";
  createComponent(chart: Cdk8sChart): ApiObject {
    return new KubeDeployment(chart, this.name, this.args);
  }
}

export class Service extends Component<KubeServiceProps> {
  name = "Service";
  createComponent(chart: Cdk8sChart): ApiObject {
    return new KubeService(chart, this.name, this.args);
  }
}

export class ConfigMap extends Component<KubeConfigMapProps> {
  name = "ConfigMap";
  createComponent(chart: Cdk8sChart): ApiObject {
    return new KubeConfigMap(chart, this.name, this.args);
  }
}
