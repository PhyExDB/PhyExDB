import { z } from "zod"

/**
 * Represents an AttributeValue List with id and name
 */
export interface ExperimentAttributeValueList extends BaseList {
  /**
   * The id of the value
   */
  id: string
  /**
   * The value of the attribute
   */
  value: string
}

/**
 * Schema for creating an ExperimentAttributeValue.
 *
 * This schema validates that the object has the following properties:
 * - `id`: A string representing the id of the value.
 * - `name`: A string representing the value of the attribute.
 */
export const experimentAttributeValueCreateSchema = z.object({
  value: z.string(),
})

/**
 * Schema for updating an ExperimentAttributeValue.
 *
 * This schema validates that the object has the following property:
 * - `name`: A string representing the value of the attribute.
 */
export const experimentAttributeValueUpdateSchema = z.object({
  value: z.string(),
})
