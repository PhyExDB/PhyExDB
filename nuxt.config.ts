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
    "nuxt-file-storage",
  ],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "", // Ensure "dark" and "light" classes are applied directly
    disableTransition: true,
  },

  runtimeConfig: {
    logLevel: "debug",
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-04-03",

  nitro: {
    experimental: {
      openAPI: true,
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

  fileStorage: {
    mount: process.env.FILE_MOUNT,
  },

  shadcn: {
    componentDir: "./app/components/ui",
  },
})
