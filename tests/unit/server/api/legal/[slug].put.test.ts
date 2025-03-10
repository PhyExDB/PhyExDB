import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { detail } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/[slug].put"

describe("Api Route PUT /api/legal/{slug}", () => {
  // definitions
  const body = generateMock(legalDocumentUpdateSchema)

  const data = detail
  const expected = { ...data, ...body }

  const context = u.getTestContext({
    data, expected, endpoint,

    body: body,
    params: { slug: data.slug },
    user: users.admin,
  })

  // mocks
  u.mockPrismaForSlugOrIdPut(context, "legalDocument")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
    u.testZodFail(context, [
      {
        body: { name: "a", text: "" },
        message: "Bitte einen Inhalt eingeben.",
      },
      {
        body: { name: "", text: "a" },
        message: "Bitte einen Namen eingeben.",
      },
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.user, users.mod])
  }
})
