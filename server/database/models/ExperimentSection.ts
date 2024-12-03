import { DataTypes, Model } from "sequelize"
import Section from "./Section"
import Experiment from "./Experiment"
import File from "./File"
import sequelize from "~~/server/utils/sequelize"

class ExperimentSection extends Model {}

ExperimentSection.init(
  {
    // Model attributes are defined here
    experiment: {
      type: DataTypes.UUID,
      references: {
        model: Experiment,
        key: "id",
      },
    },
    section: {
      type: DataTypes.UUID,
      references: {
        model: Section,
        key: "id",
      },
    },
    file: {
      type: DataTypes.UUID,
      references: {
        model: File,
        key: "id",
      },
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
