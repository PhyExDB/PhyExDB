import { v4 as uuidv4 } from "uuid"
import { users } from "~~/tests/helpers/auth"

/** example detail dto */
export const detail = {
  id: uuidv4(),
  file: {
    id: uuidv4(),
    path: "/uploads/randomId",
    mimeType: "text/plain",
    originalName: "file1",
  },
  userId: users.user.id,
}
