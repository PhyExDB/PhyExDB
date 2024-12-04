import type { BaseList } from "../Base.type"
/**
* represents an AttributeList with id and name
*/
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
export interface AttributeValue extends BaseList {
  id: string
  name: string
}
export interface AttributeDetail extends AttributeList {
  valueList: AttributeValue[]
}
