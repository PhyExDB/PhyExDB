import { describe, expectTypeOf } from "vitest"
import { experiment, comment } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug]/comments/[id].delete"

describe("Api Route /api/experiments/[slug]/comments/[id].delete", () => {
  // definitions
  const data = {
    ...comment,
    userId: users.user.id,
  }
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug, id: data.id },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")
  u.mockPrismaForIdDelete(context, "comment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testIdFails(context)

    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
