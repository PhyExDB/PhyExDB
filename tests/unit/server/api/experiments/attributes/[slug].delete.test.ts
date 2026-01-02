import { describe } from "vitest"
import { detail } from "./data"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/attributes/[slug].delete"

describe("Api Route api/experiments/attributes/[slug].delete", () => {
  const data = detail
  const expected = null

  const context = u.getTestContext({
    data, expected, endpoint,
    params: { slug: data.slug },
    user: users.admin,
  })

  u.mockPrismaForSlugOrIdDelete(context, "experimentAttribute")

  {
    u.testSuccessWithSlugAndId(context)
    u.testSlugFails(context)
    u.testAuthFail(context, [users.guest, users.user, users.mod])
  }
})
