import { DataTypes, Model } from "sequelize"
import Experiment from "./Experiment"
import ExperimentAttributeValue from "./ExperimentAttributeValue"

class Experiment_AttributeValue extends Model {}

Experiment_AttributeValue.init(
  {
    // Model attributes are defined here
    experiment: {
      type: DataTypes.UUID,
      references: {
        model: Experiment,
        key: "id",
      },
    },
    attributeValue: {
      type: DataTypes.UUID,
      references: {
        model: ExperimentAttributeValue,
        key: "id",
      },
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "Experiment_AttributeValue", // model name
  },
)

export default Experiment
