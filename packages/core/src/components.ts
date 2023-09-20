import type { ApiObject, Chart as Cdk8sChart } from "cdk8s";
import type { KubeStatefulSetProps, KubeServiceProps } from "k8s-types";
import { KubeStatefulSet, KubeService } from "k8s-types";

export abstract class Component<T> {
  constructor(private readonly args: T) {}
  createComponent(_chart: Cdk8sChart, _args: T): ApiObject {
    throw new Error("Method not implemented.");
  }
}

export class StatefulSet extends Component<KubeStatefulSetProps> {
  createComponent(chart: Cdk8sChart, args: KubeStatefulSetProps): ApiObject {
    return new KubeStatefulSet(chart, "statefulset", args);
  }
}

export class Service extends Component<KubeServiceProps> {
  createComponent(chart: Cdk8sChart, args: KubeServiceProps): ApiObject {
    return new KubeService(chart, "statefulset", args);
  }
}
