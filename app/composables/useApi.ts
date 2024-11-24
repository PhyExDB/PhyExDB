import type { UseFetchOptions } from "nuxt/app"

/**
 * A composable function that wraps the `useFetch` function with a custom API fetcher.
 *
 * @template T - The type of the response data.
 * @param {string | (() => string)} url - The URL or a function that returns the URL to fetch data from.
 * @param {UseFetchOptions<T>} [options] - Optional configuration options for the fetch request.
 * @returns {ReturnType<typeof useFetch>} The result of the `useFetch` function call.
 */
export function useAPI<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api,
  })
}
