import { describe, it, expect, expectTypeOf, vi } from "vitest"
import { detail } from "../data"
import endpoint from "~~/server/api/users/[id]/role.put"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"
import type { EndpointResult } from "~~/tests/helpers/utils"

describe("Api Route PUT /api/users/{id}", () => {
    const data = detail
    const newRole: UserRole = "MODERATOR"
    const expected = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: newRole as UserRole,
    }

    const context = u.getTestContext({
        body: { role: newRole },
        expected,
        endpoint,
        params: { id: data.id },
        user: users.admin,
        data,
    })

    u.mockPrismaForIdPut(context, "user")
    prisma.user.count = vi.fn().mockResolvedValue(1) // for last-admin guard

    {
        expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()
        u.testSuccess(context)
        u.testIdFails(context)
        u.testAuthFail(context, [users.guest, users.user, users.mod])

        it("prevents demoting last admin", async () => {
            prisma.user.findUnique = vi.fn().mockResolvedValue({ ...data, role: "ADMIN" })
            prisma.user.count = vi.fn().mockResolvedValueOnce(1)
            await expect(endpoint(u.getEvent(context))).rejects.toThrow("Cannot demote the last admin user")
        })
    }
})