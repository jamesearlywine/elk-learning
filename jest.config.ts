import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["./aws-sam", "./node_modules"],
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ["lcov", "text-summary"],
  rootDir: ".",
  moduleDirectories: ["node_modules", "<rootDir>"],
  testPathIgnorePatterns: ["./aws-sam", "./node_modules", "./testing"],
  testTimeout: 60000,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.fixtures.ts",
    "!src/**/*.config.ts",
    "!src/**/index.ts",
    "!src/handlers/**/*",
  ],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./build",
        outputName: "junit.xml",
      },
    ],
  ],
};

export default config;
