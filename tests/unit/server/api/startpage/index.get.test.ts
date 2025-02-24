import { describe, expectTypeOf } from "vitest"
import { startpage } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/startpage/index.get"

describe("Api Route GET /api/legal/{slug}", () => {
  // definitions
  const data = startpage
  const expected = data

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: data.slug },
    user: users.guest,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet(context, "legalDocument")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
  }
})
