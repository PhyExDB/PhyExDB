import { DataTypes, Model } from "sequelize"
import sequelize from "~~/server/utils/sequelize"
import type { AttributeDetail, AttributeList, AttributeValue } from "~~/shared/types/experiment/ExperimentAttribute.type"

class ExperimentAttribute extends Model {
  declare id: string
  declare name: string
  declare attributeValueList: AttributeValue[]

  /**
   * Converts the current instance to a AttributeList object.
   * @returns {AttributeList}
   */
  toAttributeList(): AttributeList {
    return {
      id: this.id,
      name: this.name,
    }
  }

  /**
   * converts the current instance to a AttributeDetail Object
   * @returns {AttributeDetail}
   */
  toDetailAttributeList(): AttributeDetail {
    return {
      id: this.id,
      name: this.name,
      valueList: this.attributeValueList,
    }
  }

  /**
   * adds a Value to an Attribute
   * @param valueList gets the added ValueList
   * @returns {valueList}
   */
  toAddValueListToAttribute(valueList: AttributeList): AttributeDetail {
    return {
      id: this.id,
      name: this.name,
      valueList: this.attributeValueList.concat(valueList),
    }
  }
}
ExperimentAttribute.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "ExperimentAttribute", // model name
  },
)

export default ExperimentAttribute
