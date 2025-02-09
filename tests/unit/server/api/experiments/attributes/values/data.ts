import { v4 as uuidv4 } from "uuid"

/**
 * A resource detail
 */
export const detail = {
  id: uuidv4(),
  value: "value",
  slug: "value",
} satisfies ExperimentAttributeValueList
