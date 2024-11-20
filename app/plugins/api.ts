/**
 * Nuxt plugin to configure and provide an API client using `$fetch`.
 *
 * This plugin sets up an API client with a base URL from the runtime configuration.
 * It also includes request and response error handling.
 *
 * @param {NuxtApp} nuxtApp - The Nuxt application instance.
 * @returns {Object} An object providing the API client.
 *
 * @example
 * const { $api } = useNuxtApp();
 * $api.get('/endpoint').then(response => {
 *   console.log(response);
 * });
 *
 * @remarks
 * - The `onRequest` hook is currently a placeholder for setting the Authorization header.
 * - The `onResponseError` hook handles 401 Unauthorized responses by redirecting to the login page.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    onRequest({ options }: any) {
      // Here we can later set the token to the Authorization header
      // Then we should remove @typescript-eslint/no-unused-vars above
    },
    async onResponseError({ response }) {
      // If the response status is 401, redirect to login page
      if (response.status === 401) {
        // Redirect to login page
        await nuxtApp.runWithContext(() => navigateTo("/login"))
      }
    },
  })

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  }
})
