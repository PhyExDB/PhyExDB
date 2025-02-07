import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { detail } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/attributes/[slug].put"

describe("Api Route api/experiments/attributes/[slug].put", () => {
  // definitions
  const body = generateMock(experimentAttributeUpdateSchema)

  const data = detail
  const expected = { ...data, ...body }

  const context = u.getTestContext({
    data, expected, endpoint,

    body: body,
    params: { slug: data.slug },
  })

  // mocks
  mockUser(users.admin)
  u.mockPrismaForSlugOrIdPut(context, "experimentAttribute")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
    u.testZodFail(context, [
      {
        body: { },
      },
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.user, users.mod])
  }
})
