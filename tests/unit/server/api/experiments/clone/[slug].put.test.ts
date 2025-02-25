import { describe, expectTypeOf, it } from "vitest"
import { detailDb, detail } from "../data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/clone/[slug].put"

describe("Api Route PUT /api/experiments/clone/[slug].put", () => {
  // definitions
  const data = {
    ...detailDb,
  }
  const expected = detail

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: data.slug },
    query: { revision: "false" },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet({ data: data }, "experiment")
  u.mockPrismaForPost({ expected: data }, "experiment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)

    u.testAuthFail(context, [users.guest, users.unverified])

    it("There can only be one revision of an experiment!", async () => {
      const c = u.extendContext(context, { query: { revision: "true" } })
      u.mockPrismaForSlugOrIdGet({ data: { ...data, revisedBy: { id: "revisedBy" } } }, "experiment")
      u.expectErrorObjectContaining(c, { statusCode: 400, message: "There can only be one revision of an experiment!" })
    })
    it("Cannot create revisions of revisions", async () => {
      const c = u.extendContext(context, { query: { revision: "true" } })
      u.mockPrismaForSlugOrIdGet({ data: { ...data, revisionOf: { id: "revisedBy" } } }, "experiment")
      u.expectErrorObjectContaining(c, { statusCode: 400, message: "Cannot create revisions of revisions" })
    })
    it("Can only revise published experiments", async () => {
      const c = u.extendContext(context, { query: { revision: "true" } })
      u.mockPrismaForSlugOrIdGet({ data: { ...data, status: "DRAFT" } }, "experiment")
      u.expectErrorObjectContaining(c, { statusCode: 400, message: "Can only revise published experiments" })
    })
  }
})
