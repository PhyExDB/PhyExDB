import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { experiment, comment } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"
import { experimentCommentCreateSchema } from "#shared/types/ExperimentComment.type"
import type { ExperimentComment } from "#shared/types/ExperimentComment.type"

import endpoint from "~~/server/api/experiments/[slug]/comments/index.post"

describe("Api Route api/experiments/[slug]/comments/index.post", () => {
  // definitions
  const body = generateMock(experimentCommentCreateSchema)

  const data = comment
  const expected = data

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug },
    body,
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")
  u.mockPrismaForPost(context, "comment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<ExperimentComment>()

    u.testSuccess(context)

    u.testZodFailWithEmptyBody(context)

    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
