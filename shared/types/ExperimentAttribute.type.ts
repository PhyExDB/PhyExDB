import type { ExperimentAttributeValueList } from "./ExperimentAttributeValue.type"

/**
 * Represents a list of attributes with their ids, names, and slugs.
 * Extends the BaseList interface.
 */
export interface ExperimentAttributeList extends BaseList {
  /**
  * The id of the Attribute
  */
  id: string
  /**
   * The name of the Attribute
   */
  name: string
  /**
   * The slug of the Attribute
   */
  slug: string
}
/**
 * Represents an AttributeDetail with id, name, slug, and valueList
 */
export interface ExperimentAttributeDetail extends ExperimentAttributeList {
  /**
   * The values of the attribute
   */
  valueList: ExperimentAttributeValueList[]
}
