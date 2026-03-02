import { describe, expectTypeOf } from "vitest"
import { experiment, comment } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug]/comments/index.get"

describe("Api Route api/experiments/[slug]/comments/index.get", () => {
  const data = [comment]
  const expected: Page<ExperimentComment> = u.page(data)

  const context = u.getTestContext({
    data, expected, endpoint,
    params: { slug: experiment.slug },
    user: users.user,
  })

  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")
  u.mockPrismaForGetAll(context, "comment")

  {
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<Page<ExperimentComment>>()

    u.testSlugFails({ ...context, data: experiment })
    u.testSuccessWithPagination(context, data)
  }
})
