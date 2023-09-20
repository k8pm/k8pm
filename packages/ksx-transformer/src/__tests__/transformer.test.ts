import { KubernetesJSX } from "../index";

describe("transformer", () => {
  it("should transform", async () => {
    const transformer = new KubernetesJSX();
    const code = `
    <Chart>
      <Service />
      <Deployment />
    </Chart>`;
    const result = await transformer.transform(code);

    expect(result).toEqual(`
      const chart = new Chart()
      Chart.addComponent('Service')
      Chart.addComponent('Deployment')
    `);
  });
});
