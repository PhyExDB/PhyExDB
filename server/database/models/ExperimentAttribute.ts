import { DataTypes, Model } from "sequelize"
import sequelize from "~~/server/utils/sequelize"
import type { AttributeList } from "~~/shared/types/experiment/ExperimentAttribute.type"

class ExperimentAttribute extends Model {
  declare id: string
  declare name: string
  /**
   * Converts the current instance to a LegalList object.
   *
   * @returns {AttributeList} An object containing the id, name, and slug of the current instance.
   */
  toAttributeList(): AttributeList {
    return {
      id: this.id,
      name: this.name,
    }
  }
}
ExperimentAttribute.init(
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
    modelName: "ExperimentAttribute", // model name
  },
)

export default ExperimentAttribute
