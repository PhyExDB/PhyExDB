import { describe, expectTypeOf, vi } from "vitest"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import type { File } from "~~/shared/types/File.type"
import endpoint from "~~/server/api/files/index.post"

describe("Api Route /api/files/index.post", () => {
  // definitions
  const body = {
    files: [
      {
        name: "file1",
        content: "file1 content",
        size: "1",
        type: "text/plain",
        lastModified: "2021-09-01T00:00:00.000Z",
      },
      {
        name: "file2",
        content: "file2 content",
        size: "2",
        type: "text/plain",
        lastModified: "2021-09-02T00:00:00.000Z",
      },
    ],
  }

  const data = undefined
  const expected = body.files.map((file: File) => {
    return {
      id: "uuid",
      path: "/uploads/randomId",
      mimeType: file.type,
      originalName: file.name,
    }
  })

  const context = u.getTestContext({
    data, expected, endpoint,

    body,
  })

  // mocks
  mockUser(users.user)
  prisma.file.create = vi.fn().mockImplementation(async (params: {
    data: { path: string, originalName: string, mimeType: string }
  }) => {
    return Promise.resolve({
      id: "uuid",
      path: params.data.path,
      mimeType: params.data.mimeType,
      originalName: params.data.originalName,
    })
  })

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<FileDetail[]>()

    u.testSuccess(context)

    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
