// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
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
