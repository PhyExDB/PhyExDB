import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    root: "./",
    dir: "./tests/",
    exclude: ["**/e2e/**"],
    environment: "nuxt",
    setupFiles: ["./tests/unit/setup.ts", "./server/utils/prisma.ts"],
    coverage: {
      reportsDirectory: "./coverage",
      provider: "istanbul",
      include: ["server/**", "shared/**"],
      reporter: ["text", "html", "json", "lcovonly"],
    },
  },
})
