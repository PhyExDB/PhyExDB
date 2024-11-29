import { DataTypes, Model } from "sequelize"
import Section from "./Section"

class ExperimentSection extends Model {}

ExperimentSection.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      references: {
        model: Section,
        key: "id",
      },
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "ExperimentSection", // model name
  },
)

export default ExperimentSection
