import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    root: "./",
    dir: "./tests/",
    exclude: ["**/e2e/**"],
    environment: "nuxt",
    setupFiles: ["./server/utils/prisma.ts"],
    coverage: {
      reportsDirectory: "./coverage",
      provider: "istanbul",
      include: ["**/server/**", "**/app/**", "**/shared/**"],
    },
  },
})
