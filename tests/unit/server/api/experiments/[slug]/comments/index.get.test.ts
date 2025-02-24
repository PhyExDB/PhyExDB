import { describe, expectTypeOf } from "vitest"
import { experiment, comment } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug]/comments/index.get"

describe("Api Route api/experiments/[slug]/comments/index.get", () => {
  // definitions
  const data = [comment]
  const expected: Page<ExperimentComment> | null = u.page(data)

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")
  u.mockPrismaForGetAll(context, "comment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<Page<ExperimentComment> | null>()

    u.testSlugFails({ ...context,data: experiment })

    u.testSuccessWithPagination(context, data)
  }
})
