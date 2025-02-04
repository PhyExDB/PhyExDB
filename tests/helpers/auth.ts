import { vi } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { getUser, getUserOrThrowError } from "~~/server/utils/auth"

/**
 * Mocks the global `getUser` function to return a specified user detail.
 */
export function mockUser(user: UserDetail | null): void {
  vi.mocked(getUser).mockResolvedValue(user)
  vi.mocked(getUserOrThrowError).mockImplementation(async (_) => {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Not logged in" })
    }
    return user
  })
}

/**
 * A collection of user objects for testing purposes.
 */
export const user = {
  user: {
    id: uuidv4(),
    name: "User",
    role: "USER",
    email: "user@test.test",
    emailVerified: true,
  },
  mod: {
    id: uuidv4(),
    name: "Moderator",
    role: "MODERATOR",
    email: "moderator@test.test",
    emailVerified: true,
  },
  admin: {
    id: uuidv4(),
    name: "Admin",
    role: "ADMIN",
    email: "admin@test.test",
    emailVerified: true,
  },
  unverified: {
    id: uuidv4(),
    name: "Unverified",
    role: "USER",
    email: "unverified@test.test",
    emailVerified: false,
  },
  guest: null,
} satisfies Record<string, UserDetail | null>
