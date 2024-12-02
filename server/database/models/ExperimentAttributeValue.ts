import { DataTypes, Model } from "sequelize"
import ExperimentAttribute from "./ExperimentAttribute"

class ExperimentAttributeValue extends Model {}

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
