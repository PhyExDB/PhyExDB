import { describe, expect, expectTypeOf, it } from "vitest"
import * as a from "~~/shared/utils/auth"
import { users } from "~~/tests/helpers/auth"

function testAbilityEquality(a1: a.Ability<[]>, a2: a.Ability<[]>): void {
  expect(a1.allowGuests).toBe(a2.allowGuests)
  expect(a1.func(users.admin)).toBe(a2.func(users.admin))
  expect(a1.func(users.mod)).toBe(a2.func(users.mod))
  expect(a1.func(users.user)).toBe(a2.func(users.user))
}

describe("Test shared auth", async () => {
  const ability: a.Ability<[]> = {
    func: user => user === users.admin,
    allowGuests: true,
  }
  const userAbility: a.UserAbility<[]> = {
    func: user => user === users.admin,
    allowGuests: false,
  }

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
    const actualUserAbility = a.defineAbility(false, user => user === users.admin)
    expectTypeOf(actualUserAbility).toEqualTypeOf<a.UserAbility<[]>>()
    expectTypeOf(actualUserAbility).toMatchTypeOf<a.Ability<[]>>()
    testAbilityEquality(actualUserAbility, userAbility)

    const actualAbility = a.defineAbility(true, user => user === users.admin)
    expectTypeOf(actualAbility).not.toEqualTypeOf<a.UserAbility<[]>>()
    expectTypeOf(actualAbility).toMatchTypeOf<a.Ability<[]>>()
    testAbilityEquality(actualAbility, ability)
  })
  it("defineAbilityNoGuests", () => {
    const actual = a.defineAbilityNoGuests(user => user === users.admin)
    expectTypeOf(actual).toEqualTypeOf<a.UserAbility<[]>>()
    testAbilityEquality(actual, userAbility)
  })
  it("defineAbilityAllowingGuests", () => {
    const actual = a.defineAbilityAllowingGuests(user => user === users.admin)
    expectTypeOf(actual).not.toEqualTypeOf<a.UserAbility<[]>>()
    expectTypeOf(actual).toMatchTypeOf<a.Ability<[]>>()
    testAbilityEquality(actual, ability)
  })
  it("abilityMapFunction", () => {
    const actual = a.abilityMapFunction(ability, func => param => !func(param))
    expectTypeOf(actual).toEqualTypeOf<a.Ability<[]>>()
    expect(actual.func(users.admin)).toBe(false)
    expect(actual.func(users.user)).toBe(true)
  })
})
