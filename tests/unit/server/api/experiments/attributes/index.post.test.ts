import { describe, expectTypeOf } from "vitest"
import { detail } from "./data"
import { generateMock } from "@anatine/zod-mock"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/attributes/index.post"

describe("Api Route /api/experiments/attributes/index.post", () => {
  // definitions
  const body = generateMock(experimentAttributeCreateSchema)

  const data = undefined
  const expected = detail

  const context = u.getTestContext({
    data, expected, endpoint,

    body
  })

  // mocks
  mockUser(users.admin)
  u.mockPrismaForPost(context, "experimentAttribute")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.user])
  }
})
