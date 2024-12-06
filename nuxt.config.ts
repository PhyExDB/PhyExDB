// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "nuxt-authorization",
  ],

  devtools: { enabled: true },

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
})
