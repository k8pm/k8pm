import { transformAsync } from "@babel/core";

describe("transformer", () => {
  it("should transform", async () => {
    const code = `
    <Chart>
      <Service />
      <Deployment />
    </Chart>`;

    const result = await transformAsync(code, {
      plugins: ["ksx"],
      parserOpts: {
        plugins: ["jsx"],
      },
    });

    expect(result?.code).toEqual(`
      const chart = new Chart()
      Chart.addComponent('Service')
      Chart.addComponent('Deployment')
    `);
  });
});
