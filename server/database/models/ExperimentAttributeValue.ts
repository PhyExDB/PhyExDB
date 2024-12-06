import { DataTypes, Model } from "sequelize"
import ExperimentAttribute from "./ExperimentAttribute"
import type { AttributeValue } from "~~/shared/types/experiment/ExperimentAttribute.type"

class ExperimentAttributeValue extends Model {
  declare id: string
  declare name: string

  /**
  * converts the instance to an AttributeValue object
  * @returns {AttributeValue}
  */
  toAtrributeValueList(): AttributeValue {
    return {
      id: this.id,
      name: this.name,
    }
  }
}

ExperimentAttributeValue.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    attributeValue: {
      type: DataTypes.UUID,
      references: {
        model: ExperimentAttribute,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "ExperimentAttributeValue", // model name
  },
)

export default ExperimentAttributeValue
