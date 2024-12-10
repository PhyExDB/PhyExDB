// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "nuxt-authorization",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
  ],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "", // Ensure "dark" and "light" classes are applied directly
    disableTransition: true,
  },

  runtimeConfig: {
    logLevel: "debug",
    databaseUser: "nuxt",
    databasePassword: "nuxt_password",
    databaseName: "phyexdb",
    databaseHost: "localhost",
    databasePort: 5432,
    public: {
      apiBase: "http://localhost:3000/api",
    },
    refreshTokenSecret: "set in env",
    accessTokenSecret: "set in env",
    expSeccondsSession: 60 * 60 * 24 * 90, // 90 days
    expSeccondsRefreshToken: 60 * 60 * 24 * 7, // 7 days
    expSeccondsAccessToken: 5 * 60, // 5 minute
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-04-03",

  nitro: {
    experimental: {
      openAPI: true,
    },
    externals: {
      external: ["pg"],
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "always-multiline",
        braceStyle: "1tbs",
        indent: 2,
        quotes: "double",
        semi: false,
      },
    },
  },

  shadcn: {
    componentDir: "./app/components/ui",
  },
})
