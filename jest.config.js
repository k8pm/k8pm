/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
  silent: false,
  rootDir: `./`,
  // moduleNameMapper: {
  //   "^@k8pm/(.*)$": "../<rootDir>/packages/$1",
  // },
  projects: [
    {
      displayName: "@k8pm/core",
      testMatch: ["<rootDir>/src/__tests__/**.test.ts"],
      testPathIgnorePatterns: ["<rootDir>/dist/"],
      preset: "ts-jest",
      rootDir: `./packages/core`,
      moduleNameMapper: {
        "^@k8pm/(.*)$": "<rootDir>/../$1/src",
      },
    },
  ],
};
