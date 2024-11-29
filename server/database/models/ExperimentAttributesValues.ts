import { DataTypes, Model } from "sequelize"

class ExperimentAttributesValues extends Model {}

ExperimentAttributesValues.init(
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
    modelName: "ExperimentAttributesValues", // model name
  },
)

export default ExperimentAttributesValues
