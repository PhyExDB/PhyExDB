import { describe } from "vitest"
import { detail } from "./data"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/attributes/values/[slug].delete"

describe("Api Route api/experiments/attributes/values/[slug].delete", () => {
  const data = detail
  const expected = null

  const context = u.getTestContext({
    data,
    expected,
    endpoint,
    params: { slug: data.slug },
    user: users.admin,
  })

  u.mockPrismaForSlugOrIdDelete(context, "experimentAttributeValue")

  {
    u.testSuccessWithSlugAndId(context)
    u.testAuthFail(context, [users.guest, users.user, users.mod])
  }
})