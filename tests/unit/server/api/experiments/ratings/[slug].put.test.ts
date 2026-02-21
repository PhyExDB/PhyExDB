import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { experiment, rating } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/ratings/[slug].put"

describe("Api Route api/experiments/ratings/[slug].put", () => {
  // ensure slug matches fixture
  if (!experiment.slug) experiment.slug = "slug"

  const body = generateMock(experimentRatingSchema)
  const expected = { value: body.value }

  const context = u.getTestContext({
    data: expected,
    expected,
    endpoint,
    params: { slug: experiment.slug }, // MUST match fixture
    body,
    user: users.user,
  })

  // Mock experiment fetch
  u.mockPrismaForSlugOrIdGet(
    {
      data: {
        ...experiment,
        signs: experiment.signs ?? [],
        previewImage: experiment.previewImage ?? { id: "dummy", path: "dummy.png", mimeType: "img/png" },
      },
    },
    "experiment",
  )

  // Mock rating findUnique
  prisma.rating.findUnique = vi.fn().mockImplementation(({ where }) => {
    // match the exact compoundId
    if (where.compoundId?.experimentId === experiment.id && where.compoundId?.userId === context.user.id) {
      return Promise.resolve(rating)
    }
    return Promise.resolve(null)
  })

  //  Mock rating update
  prisma.rating.update = vi.fn().mockImplementation(({ where, data }) => {
    if (where.compoundId?.experimentId === experiment.id && where.compoundId?.userId === context.user.id) {
      return Promise.resolve({ ...rating, ...data })
    }
    throw new Error("Not found")
  })

  // Mock experiment update inside $transaction
  prisma.experiment.findUniqueOrThrow = vi.fn().mockResolvedValue({
    ...experiment,
    ratingsSum: experiment.ratingsSum,
    ratingsCount: experiment.ratingsCount,
  })

  prisma.experiment.update = vi.fn().mockImplementation(({ data }) => {
    return Promise.resolve({ ...experiment, ...data })
  })

  // Type test
  expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

  // Run success scenario
  u.testSuccess(context)

  // Run Zod validation failure
  u.testZodFail(context, [{ body: {} }])

  // Run auth failure
  u.testAuthFail(context, [users.guest, users.unverified])
})
