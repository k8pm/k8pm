import { FreightManager } from "@fr8/core";
import { chart } from "@fr8/simple-chart-example";

const manager = new FreightManager("my-namespace");

manager
  .installFromModule("my-release", chart, {
    // ...values
  })
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
  });

// we can similarly uninstall a chart

// manager
//   .uninstall("my-release")
//   .then(() => {
//     console.log("Done!");
//   })
//   .catch((err) => {
//     console.error(err);
//   });
