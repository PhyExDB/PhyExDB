import { fileURLToPath } from "node:url"
import { defineConfig, devices } from "@playwright/test"
import type { ConfigOptions } from "@nuxt/test-utils/playwright"
import dotenv from "dotenv"

dotenv.config({ path: ".env.test" })

export default defineConfig<ConfigOptions>({
  testDir: "./tests/e2e", // Set your test directory
  timeout: 60000,
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
})
