import { describe, it, expect, expectTypeOf, vi } from "vitest"
import { detail } from "../data"
import endpoint from "~~/server/api/users/[id]/ban.post"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"
import type { EndpointResult } from "~~/tests/helpers/utils"

describe("Api Route POST /api/users/{id}/ban", () => {
  const data = { ...detail, banned: false }

  const expected = {
    id: data.id,
    banned: true,
  }

  const context = u.getTestContext({
    endpoint,
    params: { id: data.id },
    user: users.admin,
    data,
    expected,
  })

  u.mockPrismaForIdPut(context, "user")

  {
    // Type-level contract
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    // Success path
    u.testSuccess(context)

    // Invalid / missing ID
    u.testIdFails(context)

    // Authorization: only admins can ban users
    u.testAuthFail(context, [users.guest, users.user, users.mod])

    it("is a no-op if user is already banned", async () => {
      prisma.user.findUnique = vi.fn().mockResolvedValue({
        ...data,
        banned: true,
      })

      const result = await endpoint(u.getEvent(context))

      expect(result).toEqual({
        id: data.id,
        banned: true,
      })
    })

    it("returns 404 if user does not exist", async () => {
      prisma.user.findUnique = vi.fn().mockResolvedValue(null)

      await expect(endpoint(u.getEvent(context))).rejects.toThrow("User not found")
    })
  }
})
