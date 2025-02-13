import { describe, expect, it } from "vitest"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

import { defineAbility } from "~~/shared/utils/auth"
import * as a from "~~/server/utils/authorization"

describe("Test utils authorization", async () => {
    const ability = defineAbility(true, (user) => user === users.admin)
    const userAbility = defineAbility(false, (user) => user === users.admin)

    it("authorize", async () => {
        expect(await a.authorize(u.getEvent({ user: users.admin }), ability)).toBe(users.admin)
        await expect(
            a.authorize(u.getEvent({ user: users.user }), ability)
        ).rejects.toMatchObject({
            statusCode: 403,
        })
        await expect(
            a.authorize(u.getEvent({ user: users.guest }), userAbility)
        ).rejects.toMatchObject({
            statusCode: 401,
        })
    })
    it("authorizeUser", async () => {
        expect(await a.authorizeUser(u.getEvent({ user: users.admin }), userAbility)).toBe(users.admin)
        await expect(
            a.authorizeUser(u.getEvent({ user: users.user }), userAbility)
        ).rejects.toMatchObject({
            statusCode: 403,
        })
    })
})
