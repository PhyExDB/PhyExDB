import { describe, it, expect, expectTypeOf, vi } from "vitest"
import { detail } from "../data"
import endpoint from "~~/server/api/users/[id]/delete"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"
import type { EndpointResult } from "~~/tests/helpers/utils"

describe("Api Route DELETE /api/users/{id}", () => {
  const data = detail

  const expected = {
    id: data.id,
    deleted: true,
  }

  const context = u.getTestContext({
    endpoint,
    params: { id: data.id },
    user: users.admin,
    data,
    expected,
  })

  // Mocking Prismas delete-by-id behavior
  u.mockPrismaForIdDelete(context, "user")

  {
    // Ensuring endpoint returns the expected shape
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    // Success path: admin deletes a user
    u.testSuccess(context)

    // Invalid / missing ID
    u.testIdFails(context)

    // Authorization: only admins can delete users
    u.testAuthFail(context, [users.guest, users.user, users.mod])

    it("prevents deleting the last admin", async () => {
      prisma.user.findUnique = vi.fn().mockResolvedValue({
        ...data,
        role: "ADMIN",
      })

      prisma.user.count = vi.fn().mockResolvedValueOnce(1)

      await expect(endpoint(u.getEvent(context))).rejects.toThrow(
        "Cannot delete the last admin user",
      )
    })

    it("returns 404 if user does not exist", async () => {
      prisma.user.findUnique = vi.fn().mockResolvedValue(null)

      await expect(endpoint(u.getEvent(context))).rejects.toThrow("User not found")
    })
  }
})
