import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { detail } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/attributes/values/index.post"

describe("Api Route /api/experiments/attributes/values/index.post", () => {
  // definitions
  const body = generateMock(experimentAttributeValueCreateSchema)

  const data = undefined
  const expected = detail

  const context = u.getTestContext({
    data, expected, endpoint,

    body,
    user: users.admin,
  })

  // mocks
  u.mockPrismaForPost(context, "experimentAttributeValue")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testZodFailWithEmptyBody(context)
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.user])
  }
})
