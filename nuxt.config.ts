// https://nuxt.com/docs/api/configuration/nuxt-config
import vue from "@vitejs/plugin-vue"
import { copyPrismaAssets } from "./server/utils/copy-prisma-assets"

export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "nuxt-file-storage",
    "@nuxt/image",
    "@vueuse/nuxt",
    "nuxt-tiptap-editor",
    "nuxt-nodemailer",
  ],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "", // Ensure "dark" and "light" classes are applied directly
    disableTransition: true,
  },

  runtimeConfig: {
    logLevel: "debug",
    fileMount: "./public",
    trustedOrigins: "http://localhost:3000",
    appName: "PhyExDB",
    public: {
      sectionFileAccepts: "image/jpeg,image/png,image/webp,application/pdf,video/mp4",
      fileStorage: {
        mount: "public",
      },
    },
  },

  // build: {
  //   transpile: ["@vue-email/components"], // Ensure Vue Email is compiled
  // },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-04-03",

  nitro: {
    experimental: {
      openAPI: true,
      tasks: true,
    },
    imports: {
      dirs: [
        "server/lib",
      ],
    },
    rollupConfig: {
      plugins: [
        vue(),
      ],
    },
  },

  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  hooks: {
    "nitro:build:public-assets": copyPrismaAssets,
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

  // In order for mails from nodemailer to be visible in mailpit a username and password in the auth field must be set
  nodemailer: {
    from: "email@test.test",
    host: "localhost",
    port: 1025,
    secure: false,
    auth: {
      user: "test@test.test",
      pass: "null",
    },
  },

  shadcn: {
    componentDir: "./app/components/ui",
  },
})
