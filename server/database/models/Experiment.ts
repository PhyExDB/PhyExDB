import { DataTypes, Model } from "sequelize"
import User from "./User"
import sequelize from "~~/server/utils/sequelize"

class Experiment extends Model {}

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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "Experiment", // model name
  },
)

export default Experiment
