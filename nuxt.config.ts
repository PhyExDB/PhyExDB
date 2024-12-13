// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "nuxt-authorization",
    "@sidebase/nuxt-auth",
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
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: "AUTH_ORIGIN",
    baseURL: "http://localhost:3000/api/auth",
    provider: {
      type: "local",
      token: {
        signInResponseTokenPointer: "/accessToken",
        type: "Bearer",
        cookieName: "auth.token",
        headerName: "Authorization",
        maxAgeInSeconds: 180000, // todo
        // sameSiteAttribute: "lax",
        // cookieDomain: "sidebase.io",
        secureCookieAttribute: false,
        httpOnlyCookieAttribute: false,
      },
      endpoints: {
        signIn: { path: "/login", method: "post" },
        signOut: { path: "/logout", method: "post" },
        signUp: { path: "/register", method: "post" },
        getSession: { path: "/session", method: "get" },
      },
      refresh: {
        isEnabled: true,
        endpoint: { path: "/refresh", method: "post" },
        refreshOnlyToken: false,
        token: {
          signInResponseRefreshTokenPointer: "/refreshToken",
          refreshResponseTokenPointer: "/refreshToken",
          refreshRequestTokenPointer: "/refreshToken",
          cookieName: "auth.refreshToken",
          maxAgeInSeconds: 180000, // todo
          // sameSiteAttribute: "lax",
          // secureCookieAttribute: false,
          // cookieDomain: "sidebase.io",
          httpOnlyCookieAttribute: false,
        },
      },
      session: {
        dataType: {
          id: "string",
          username: "USER | MODERATOR | ADMIN",
          email: "string",
          role: "string",
          verified: "boolean",
        },
      },
      pages: {
        login: "/login",
      },
    },
    sessionRefresh: {
      enablePeriodically: false,
      enableOnWindowFocus: false,
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
