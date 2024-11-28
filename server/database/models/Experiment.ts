import { DataTypes, Model } from "sequelize"
import sequelize from "../utils/sequelize"

const experimentStatusEnum = DataTypes.ENUM("Draft", "Submitted", "Accepted")
class Experiment extends Model {}

Experiment.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experimentStatus: {
      type: experimentStatusEnum,
      allowNull: false,
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
