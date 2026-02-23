import { describe, expectTypeOf, vi } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { experiment, rating } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"
import endpoint from "~~/server/api/experiments/ratings/[slug].put"

describe("Api Route api/experiments/ratings/[slug].put", () => {
  type Result = EndpointResult<typeof endpoint>

  // Generate valid request body
  const body = generateMock(experimentRatingSchema)

  // Expected result after update
  const expected: Result = { ...rating, ...body }

  // Create test context
  const context = u.getTestContext({
    data: rating,
    expected,
    endpoint,
    params: { slug: experiment.slug },
    body,
    user: users.user,
  })

  //  MOCKS

  // Mock experiment.update
  prisma.experiment.update = vi.fn().mockResolvedValue(experiment)

  // Then mock experiment lookup (sets findUnique, findFirst etc.)
  u.mockPrismaForGet(
    { data: experiment },
    "experiment",
    (where: { OR?: { id?: string, slug?: string }[], id?: string }) =>
      where.OR?.some((o: any) => o.id === experiment.id || o.slug === experiment.slug)
      || where.id === experiment.id
      || false,
  )

  // Mock rating update
  u.mockPrismaForPut(
    context,
    "rating",
    (where: { compoundId?: { experimentId?: string, userId?: string } }) =>
      where.compoundId?.experimentId === experiment.id
      && where.compoundId?.userId === users.user.id,
  )

  prisma.$transaction = vi.fn().mockImplementation((fn: any) => fn(prisma))
  //  TESTS
  expectTypeOf<Result>().toEqualTypeOf<typeof expected>()

  // Success
  u.testSuccess(context)

  // Zod validation fails when body is empty
  u.testZodFail(context, [{ body: {} }])

  // Auth fails for guest/unverified users
  u.testAuthFail(context, [users.guest, users.unverified])
})
