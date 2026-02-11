import { z } from "zod"

/**
 * Represents an AttributeValue List with id and name
 */
export interface ExperimentAttributeValueList extends SlugList {
  /**
   * The value of the attribute
   */
  value: string
  /**
   * The order of the attribute value within its attribute
   */
  order: number
}

/**
 * Represents an AttributeValueDetail with id, value, slug, and attribute
 */
export interface ExperimentAttributeValueDetail extends ExperimentAttributeValueList {
  /**
   * The attribute of the value.
   */
  attribute: ExperimentAttributeList
}

/**
 * Schema for creating an ExperimentAttributeValue.
 *
 * This schema validates that the object has the following properties:
 * - `id`: A string representing the id of the value.
 * - `value`: A string representing the value of the attribute.
 */
export const experimentAttributeValueCreateSchema = z.object({
  attribute: z.string(),
  value: z.string(),
})

/**
 * Schema for updating an ExperimentAttributeValue.
 *
 * This schema validates that the object has the following property:
 * - `value`: A string representing the value of the attribute.
 */
export const experimentAttributeValueUpdateSchema = z.object({
  value: z.string(),
})
