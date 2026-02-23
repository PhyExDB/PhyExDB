import { describe, expectTypeOf } from "vitest"
import { detail, detailDb } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug].get"

describe("Api Route /api/experiments/[slug].get", () => {
  // definitions
  const data = detailDb
  const expected = detail

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: data.slug },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet(context, "experiment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
  }
})
