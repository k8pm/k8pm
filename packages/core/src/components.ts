import type { ApiObject, Chart as Cdk8sChart } from "cdk8s";
import type {
  KubeStatefulSetProps,
  KubeServiceProps,
  KubeConfigMapProps,
} from "@fr8/k8s-types";
import { KubeConfigMap, KubeStatefulSet, KubeService } from "@fr8/k8s-types";
import type { ChartContext } from "./chart";

export abstract class Component<T> {
  constructor(private readonly args: T) {}
  createComponent(_chart: Cdk8sChart, _args: T, _ctx: ChartContext): ApiObject {
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

export class ConfigMap extends Component<KubeConfigMapProps> {
  createComponent(chart: Cdk8sChart, args: KubeConfigMapProps): ApiObject {
    return new KubeConfigMap(chart, "statefulset", args);
  }
}
