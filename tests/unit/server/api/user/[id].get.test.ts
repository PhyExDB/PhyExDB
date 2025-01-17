import { describe, expect, expectTypeOf, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { UserRole } from "@prisma/client"
import type { H3Event, EventHandlerRequest } from "h3"
import getUser from "~~/server/api/users/[id].get"

describe("Api Route GET /api/user/{id}", async () => {
  it.each(["username", "id"])("should get a user by %s", async (param) => {
    const user = {
      id: uuidv4(),
      name: "John Doe",
      email: "john.doe@test.test",
      role: UserRole.USER,
      emailVerified: false,
    }

    prisma.user.findFirst = vi.fn().mockImplementation(({ where }) => {
      if (where.id === user.id || where.name === user.name) {
        return Promise.resolve(user)
      }
      return Promise.resolve(null)
    })

    const event = {
      context: {
        params: {
          id: param === "username" ? user.name : user.id,
        },
      },
    } as unknown as H3Event<EventHandlerRequest>

    const response = await getUser(event)

    expectTypeOf(response).toEqualTypeOf<UserDetail>()
    expect(response).toStrictEqual(user)
  })

  it("should return an error when an unknown id is passed", async () => {
    prisma.user.findFirst = vi.fn().mockResolvedValue(null)

    const event = {
      context: {
        params: {
          id: uuidv4(),
        },
      },
    } as unknown as H3Event<EventHandlerRequest>

    await expect(getUser(event)).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    })
  })

  it("should return an error when no id is passed", async () => {
    const event = {
      context: {
        params: {},
      },
    } as unknown as H3Event<EventHandlerRequest>

    await expect(getUser(event)).rejects.toThrowError(
      expect.objectContaining({
        message: "Invalid username or id",
        statusCode: 400,
      }),
    )
  })
})
