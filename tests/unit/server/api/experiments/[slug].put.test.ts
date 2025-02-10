import { describe, expectTypeOf, vi } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { detail, detailDb } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug].put"

describe("Api Route api/experiments/[slug].put", async () => {
  // definitions
  const sections: ExperimentSectionList[] = []
  const attributes: ExperimentAttributeDetail[] = []

  const body = {
    ...generateMock(getExperimentSchema(sections, attributes)),
    sections: [],
    attributes: [],
  }

  const data = detailDb
  const expected = detail

  const context = u.getTestContext({
    data, expected, endpoint,

    body: body,
    params: { slug: data.slug },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdPut(context, "experiment")
  prisma.$transaction = vi.fn().mockResolvedValue([undefined, detailDb])
  prisma.experimentFile.deleteMany = vi.fn()
  vi.stubGlobal("$fetch", async (path: any) => {
    if(path === "/api/experiments/sections") {
      return sections
    } else if(path === "/api/experiments/attributes") {
      return attributes
    }
  })

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
    u.testZodFail(context, [
      {
        body: { },
      },
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.mod])
  }
})
