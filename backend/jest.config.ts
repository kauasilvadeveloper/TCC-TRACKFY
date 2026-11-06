import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@octokit/rest$": "<rootDir>/tests/mocks/octokit.ts",
  },
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/server.ts",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};

export default config;
