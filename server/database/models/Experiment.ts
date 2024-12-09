import { DataTypes, Model } from "sequelize"
import User from "./User"
import type { ExperimentDetail, ExperimentList } from "~~/shared/types/Experiment.type"

class Experiment extends Model {
  declare id: string
  declare createdBy: string
  declare title: string
  declare experimentStatus: string
  declare duration: number

  toExperimentList(): ExperimentList {
    return {
      id: this.id,
      title: this.title,
    }
  }

  toExperimentDetail(): ExperimentDetail {
    return {
      id: this.id,
      createdBy: this.createdBy,
      title: this.title,
      experimentStatus: this.experimentStatus,
      duration: this.duration,
    }
  }
}

Experiment.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experimentStatus: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["Draft", "Submitted", "Accepted"],
      defaultValue: "Draft",
    },
    // Duration in minutes
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "Experiment", // model name
  },
)

export default Experiment
