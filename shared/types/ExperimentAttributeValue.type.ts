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
  name: string
}
