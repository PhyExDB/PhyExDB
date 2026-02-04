import { v4 as uuidv4 } from "uuid"
import { users } from "~~/tests/helpers/auth"

/**
 * Comment
 */
export const comment = {
  id: uuidv4(),
  text: "text",
  user: {
    id: users.user.id,
    name: "name",
  },
} satisfies ExperimentComment

/**
 * Experiment
 */
export const experiment: ExperimentList = {
  id: uuidv4(),
  slug: "test-experiment",
  name: "Test experiment",
  userId: users.user.id,
  status: "published",
  duration: 10,
  attributes: [],
  revisionOf: undefined,
  revisedBy: undefined,
  ratingsCount: 0,
  ratingsSum: 0,
}
