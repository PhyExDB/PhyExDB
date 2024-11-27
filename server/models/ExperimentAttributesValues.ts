import { DataTypes, Model } from "sequelize"
import sequelize from "../utils/sequelize"
import ExperimentAttributes from "./ExperimentAttributes"

class ExperimentAttributesValues extends Model {}

ExperimentAttributesValues.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      references: {
        model: ExperimentAttributes,
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
    modelName: "ExperimentAttributesValues", // model name
  },
)

export default ExperimentAttributesValues
