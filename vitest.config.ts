import { defineVitestConfig } from "@nuxt/test-utils/config"
import AutoImport from "unplugin-auto-import/vite"
import { loadEnv } from "vite"

export default defineVitestConfig({
  plugins: [
    AutoImport({
      imports: [
        "vue",
        "vitest",
      ],
      dirs: [
        "./server/utils",
      ],
      dts: true,
    }),
  ],
  test: {
    root: "./",
    dir: "./tests/",
    exclude: ["**/e2e/**"],
    environment: "nuxt",
    setupFiles: ["./tests/unit/setup.ts"],
    env: loadEnv("test", process.cwd(), ""),
    coverage: {
      reportsDirectory: "./coverage",
      provider: "istanbul",
      include: ["server/**", "shared/**"],
      reporter: ["text", "html", "json", "lcovonly"],
    },
  },
})
