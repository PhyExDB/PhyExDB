import { describe, expectTypeOf } from "vitest"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug]/comments/[id]/vote.post"
import { experiment } from "~~/tests/unit/server/api/experiments/ratings/data"
import { comment } from "~~/tests/unit/server/api/experiments/[slug]/comments/data"

describe("Api Route /api/experiments/[slug]/comments/[id].vote.post", () => {
  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")

  vi.mocked(prisma.$transaction).mockImplementation(async cb => cb(prisma))

  expectTypeOf<EndpointResult<typeof endpoint>>()
    .toEqualTypeOf<{ voted: boolean }>()

  describe("vote behavior", () => {
    it("should successfully vote for a comment", async () => {
      vi.mocked(prisma.commentVote.findUnique).mockResolvedValue(null)

      const context = u.getTestContext({
        data: comment,
        expected: { voted: true },
        endpoint,
        params: { slug: experiment.slug, id: comment.id },
        user: users.user,
      })

      await u.expectSuccess(context)
    })

    it("should remove vote if it already exists", async () => {
      vi.mocked(prisma.commentVote.findUnique).mockResolvedValue({
        userId: users.user.id,
        commentId: comment.id,
      } as any)

      const context = u.getTestContext({
        data: comment,
        expected: { voted: false },
        endpoint,
        params: { slug: experiment.slug, id: comment.id },
        user: users.user,
      })

      await u.expectSuccess(context)
    })
  })

  describe("common failures", () => {
    const baseContext = u.getTestContext({
      data: comment,
      expected: { voted: true },
      endpoint,
      params: { slug: experiment.slug, id: comment.id },
      user: users.user,
    })

    u.testIdFails(baseContext)
    u.testAuthFail(baseContext, [users.guest, users.unverified])
  })
})
