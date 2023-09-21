/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
  silent: false,
  rootDir: `./`,
  projects: [
    {
      displayName: "@fr8/core",
      preset: "ts-jest",
      testMatch: ["<rootDir>/packages/core/src/**/*.test.ts"],
      testPathIgnorePatterns: ["<rootDir>/packages/core/dist/"],
    },
  ],
};
