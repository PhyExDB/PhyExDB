// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from "node:fs/promises"
import path from "node:path"

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
    public: {
      sectionFileAccepts: "image/jpeg,image/png,image/webp,application/pdf,video/mp4",
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-04-03",

  nitro: {
    experimental: {
      openAPI: true,
      tasks: true,
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
    "nitro:build:public-assets": async (nitro) => {
      // Copy Prisma schema and migrations to the output directory
      const prismaInDir = path.join(__dirname, "prisma")
      const prismaOutDir = path.join(nitro.options.output.dir, "prisma")
      await fs.cp(prismaInDir, prismaOutDir, { recursive: true })

      // Copy Prisma schema engine to the output directory
      const prismaEnginesInDir = path.join(__dirname, "node_modules", "@prisma", "engines")
      const prismaEnginesOutDir = path.join(nitro.options.output.serverDir, "node_modules", "@prisma", "engines")
      const prismaEnginesFiles = await fs.readdir(prismaEnginesInDir)
      for (const file of prismaEnginesFiles) {
        if (/^schema-engine-.+$/.test(file)) {
          await fs.cp(path.join(prismaEnginesInDir, file), path.join(prismaEnginesOutDir, file))
        }
      }
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
    mount: process.env.NUXT_FILE_MOUNT,
  },

  // In order for mails from nodemailer to be visible in mailpit a username and password in the auth field must be set
  nodemailer: {
    from: "email@email.com",
    host: "localhost",
    port: 1025,
    secure: false,
    auth: {
      user: "test@gmail.com",
      pass: "null",
    },
  },

  shadcn: {
    componentDir: "./app/components/ui",
  },
})
