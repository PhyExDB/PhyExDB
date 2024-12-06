import type { BaseList } from "../Base.type"
/** represents an AttributeList with id and name */
export interface AttributeList extends BaseList {
  /**
  * the id of the Attribute
  */
  id: string
  /**
   * the name of the Attribute
   */
  name: string
}
/**
 * represents an AttributeValue List with id and name
 */
export interface AttributeValue extends BaseList {
  /**
   * the id of the value
   */
  id: string
  /**
   * the value of the attribute
   */
  name: string
}
/**
 * extends AttributeList and adds AttributeValue
 */
export interface AttributeDetail extends AttributeList {
  /**
   * attribute Value as an Array
   */
  valueList: AttributeValue[]
}
