import { describe, expect, expectTypeOf, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import listUsers from "~~/server/api/users/index.get"
import { mockUser, user } from "~~/tests/helpers/auth"

mockUser(user.admin)

describe("Api Route GET /api/users", async () => {
  it("should return a list of users", async () => {
    const user = {
      id: uuidv4(),
      name: "John Doe",
      email: "john.doe@test.test",
      role: "USER",
      emailVerified: false,
      banned: false,
    }
    const moderator = {
      id: uuidv4(),
      name: "Jane Doe",
      email: "jane.doe@test.test",
      role: "MODERATOR",
      emailVerified: true,
      banned: false,
    }
    const admin = {
      id: uuidv4(),
      name: "Admin",
      email: "admin@test.test",
      role: "ADMIN",
      emailVerified: true,
      banned: false,
    }
    const users = [
      user,
      moderator,
      admin,
    ]
    const expected = {
      items: users,
      pagination: {
        page: 1,
        pageSize: 12,
        total: undefined,
        totalPages: NaN,
      },
    }

    prisma.user.findMany = vi.fn().mockResolvedValue(users)

    const event = {} as unknown as H3Event<EventHandlerRequest>

    const response = await listUsers(event)

    expectTypeOf(response).toEqualTypeOf<Page<UserDetailAdmin>>()
    expect(response).toStrictEqual(expected)
  })
})
