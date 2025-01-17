import { describe, expect, expectTypeOf, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { UserRole } from "@prisma/client"
import type { H3Event, EventHandlerRequest } from "h3"
import listUsers from "~~/server/api/users/index.get"

describe("Api Route GET /api/users", async () => {
  it("should return a list of users", async () => {
    const user = {
      id: uuidv4(),
      name: "John Doe",
      email: "john.doe@test.test",
      role: UserRole.USER,
      emailVerified: false,
    }
    const moderator = {
      id: uuidv4(),
      name: "Jane Doe",
      email: "jane.doe@test.test",
      role: UserRole.MODERATOR,
      emailVerified: true,
    }
    const admin = {
      id: uuidv4(),
      name: "Admin",
      email: "admin@test.test",
      role: UserRole.ADMIN,
      emailVerified: true,
    }
    const users = [
      user,
      moderator,
      admin,
    ]

    prisma.user.findMany = vi.fn().mockResolvedValue(users)

    const event = {} as unknown as H3Event<EventHandlerRequest>

    const response = await listUsers(event)

    expectTypeOf(response).toEqualTypeOf<UserList[]>()
    expect(response).toStrictEqual(users)
  })
})
