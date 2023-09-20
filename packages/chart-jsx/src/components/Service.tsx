import { useEffect, type FunctionComponent } from "react";
import type { KubeServiceProps } from "../imports/k8s";
import { KubeService } from "../imports/k8s";
import { useChartContext } from "../context";

interface ServiceProps {
  name: string;
  spec?: KubeServiceProps;
}

export const Service: FunctionComponent<ServiceProps> = (props) => {
  const chart = useChartContext();
  const { name, spec } = props;

  useEffect(() => {
    const apply = () => new KubeService(chart, name, spec);

    apply();
  }, [chart, name, spec]);

  return <div>jell</div>;
};
