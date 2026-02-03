import { v4 as uuidv4 } from "uuid"
import { users } from "~~/tests/helpers/auth"

/**
 * Comment
 */
export const comment = {
  id: uuidv4(),
  text: "text",
  upvotesCount: 0,
  userHasVoted: false,
  parentId: null,
  children: [],
  user: {
    id: users.user.id,
    name: "name",
  },
} satisfies ExperimentComment

/**
 * Experiement
 */
export const experiment = {
  id: uuidv4(),
  slug: "slug",
  userId: users.user.id,
  commentsEnabled: true,
  comments: [comment],
} as unknown as ExperimentList
