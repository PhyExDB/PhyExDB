import { vi } from "vitest"

/**
 * Mocks the global `getUser` function to return a specified user detail.
 */
export function mockUser(user: UserDetail | null): void {
  // getUser = vi.fn().mockResolvedValue(user)
  // vi.stubGlobal("getUser", () => Promise.resolve(user))
  // todo ...
}
