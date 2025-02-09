import { vi } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { getUser, getUserOrThrowError } from "~~/server/utils/auth"

/**
 * A collection of user objects for testing purposes.
 */
export const users = {
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
