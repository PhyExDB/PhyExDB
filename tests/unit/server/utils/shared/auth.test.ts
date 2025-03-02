import { describe, expect, expectTypeOf, it } from "vitest"
import * as a from "~~/shared/utils/auth"
import { users } from "~~/tests/helpers/auth"

function testAbilityEquality(a1: a.Ability<[]>, a2: a.Ability<[]>): void {
  expect(a1(users.admin)).toBe(a2(users.admin))
  expect(a1(users.mod)).toBe(a2(users.mod))
  expect(a1(users.user)).toBe(a2(users.user))
}

describe("Test shared auth", async () => {
  const ability: a.Ability<[]> = user => user === null || user === users.admin
  const userAbility: a.Ability<[]> = user => user !== null && user === users.admin

  it("sessionToUserDetail", () => {
    expect(a.sessionToUserDetail(undefined)).toBe(undefined)
    expect(a.sessionToUserDetail({ user: {
      ...users.admin,
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } })).toMatchObject(users.admin)
  })

  it("evaluateAbility", () => {
    expect(a.evaluateAbility(users.admin, ability)).toBe(users.admin)
    expect(a.evaluateAbility(users.user, ability)).toBe("Not authorized")
    expect(a.evaluateAbility(null, ability)).toBe(null)

    expect(a.evaluateAbility(null, userAbility)).toBe("Not logged in")
  })
  it("evaluateUserAbility", () => {
    expect(a.evaluateUserAbility(users.admin, userAbility)).toBe(users.admin)
    expect(a.evaluateUserAbility(users.user, userAbility)).toBe("Not authorized")
  })
  it("defineAbility", () => {
    const actualAbility = a.defineAbility(user => user === null || user === users.admin)
    expectTypeOf(actualAbility).toMatchTypeOf<a.Ability<[]>>()
    testAbilityEquality(actualAbility, ability)
  })
  it("defineAbilityNoGuests", () => {
    const actual = a.defineAbilityNoGuests(user => user === users.admin)
    expectTypeOf(actual).toEqualTypeOf<a.UserAbility<[]>>()
    testAbilityEquality(actual, userAbility)
  })
})
