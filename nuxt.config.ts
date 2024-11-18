// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint"],

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-04-03",

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
