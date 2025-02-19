import type { H3Event, EventHandlerRequest } from "h3"

/**
 * Type of Event given to Endpoints
 */
export type Event = H3Event<EventHandlerRequest>

/**
 * Executes a given asynchronous function and throws a 404 error if the result is `null`.
 */
export async function nullTo404<T>(
  call: () => Promise<T | null>,
): Promise<T> {
  const result = await call()
  if (result === null) {
    throw createError({ status: 404, message: "Not found" })
  }
  return result
}
