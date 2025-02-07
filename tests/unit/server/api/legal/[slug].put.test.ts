import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { detail } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/[slug].put"

describe("Api Route PUT /api/legal/{slug}", () => {
  // definitions
  const body = generateMock(legalDocumentUpdateSchema)

  const data = detail
  const expected = { ...data, ...body }

  const params = { slug: data.slug }
  const event = u.getEvent({ params, body })
  const query = {}

  const context = {
    data,
    expected,
    endpoint,

    body,
    params,
    query,
  }

  // mocks
  mockUser(users.admin)
  u.mockPrismaForSlugOrIdPut("legalDocument", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
    u.testZodFailMessage(context, [
      {
        body: { name: "a", text: "" },
        message: "Please enter some content",
      },
      {
        body: { name: "", text: "a" },
        message: "Please enter a name",
      },
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.user])
  }
})
