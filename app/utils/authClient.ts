import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"
import type { auth } from "~~/server/utils/auth"

/**
 * authClient
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})
