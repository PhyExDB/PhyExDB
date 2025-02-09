import type { File } from "~~/shared/types/File.type"
import { users } from "~~/tests/helpers/auth"

/** example files given to the post endpoint  */
export const filesIn = [
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
  ]

/** example files as in the database  */
export const fileDetails = filesIn.map((file: File) => {
  return {
    id: "uuid",
    path: "/uploads/randomId",
    mimeType: file.type,
    originalName: file.name,
  }
})

/** example files as in the database  */
export const files = fileDetails.map((file) => {
  return {
    ...file,
    createdById: users.user.id
  }
})
