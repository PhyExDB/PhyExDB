import { DataTypes, Model } from "sequelize"
import sequelize from "../utils/sequelize"
import Section from "./Section"

class Experiment extends Model {}

Experiment.init(
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
    modelName: "Experiment", // model name
  },
)

export default Experiment
