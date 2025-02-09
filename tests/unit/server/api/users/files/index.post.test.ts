import { describe, expectTypeOf, vi } from "vitest"
import { detail } from "./data"
import { generateMock } from "@anatine/zod-mock"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"
import { v4 as uuidv4 } from "uuid"

import endpoint from "~~/server/api/users/files/index.post"

describe("Api Route /api/files/users/index.post", () => {
  // definitions
  
  const data = detail
  const expected = detail

  const body = {
    fileId: detail.file.id,
  }
  
  const context = u.getTestContext({
    data, expected, endpoint,

    body,
    user: users.user
  })

  // mocks
  u.mockPrismaForIdGet({data: {...detail.file, createdById: users.user.id}}, "file")
  u.mockPrismaForPost(context, "userFile")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    it("should_fail_when_unknown_fileId", async () => {
      u.expectErrorObjectMatching(
        {...context, body: {fileId: uuidv4()}},
        { message: "File not found" }
      )
    })
    u.testZodFail(context, [
      {
        body: { id: "noId" },
      }
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest])
  }
})
