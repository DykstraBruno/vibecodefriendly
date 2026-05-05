import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/__smoke__.test.ts",
        "src/types/**",
        "src/index.ts",
        "src/sdk/**",
      ],
      reporter: ["text", "html"],
    },
  },
});
