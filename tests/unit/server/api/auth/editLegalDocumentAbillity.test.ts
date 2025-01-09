import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { v4 as uuidv4 } from "uuid"

describe("Api Route GET /api/legal", async () => {
  it.each([
    {
      id: uuidv4(),
      username: "User",
      role: UserRole.User,
      emailVerified: true,
      email: "user@test.test",
    },
    {
      id: uuidv4(),
      username: "Moderator",
      role: UserRole.Moderator,
      emailVerified: true,
      email: "moderator@test.test",
    },
    {
      id: uuidv4(),
      username: "Admin",
      role: UserRole.Admin,
      emailVerified: true,
      email: "admin@test.test",
    },
  ])(`aaa`, async (user) => {
    // vi.mock("getUser", vi.fn().mockResolvedValue(user))

    // const response = await allows(editLegalDocumentAbillity)

    // expectTypeOf(response).toEqualTypeOf<boolean>()
    // expect(response).toBe(user.role === UserRole.Admin)
  })
})
