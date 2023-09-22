/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
  silent: false,
  rootDir: `./`,
  // moduleNameMapper: {
  //   "^@fr8/(.*)$": "../<rootDir>/packages/$1",
  // },
  projects: [
    {
      displayName: "@fr8/core",
      testMatch: ["<rootDir>/src/__tests__/**.test.ts"],
      testPathIgnorePatterns: ["<rootDir>/dist/"],
      preset: "ts-jest",
      rootDir: `./packages/core`,
      moduleNameMapper: {
        "^@fr8/(.*)$": "<rootDir>/../$1/src",
      },
    },
  ],
};
