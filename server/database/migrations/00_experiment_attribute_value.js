import { DataTypes } from "sequelize"
import ExperimentAttribute from "../models/ExperimentAttribute"
/**
 * run the value migration
 */
async function up({ context: queryInterface }) {
  await queryInterface.createTable("ExperimentAttributeValues", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    attributeValue: {
      type: DataTypes.UUIDV4,
      refereces: {
        model: ExperimentAttribute,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.Date,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.Date,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  })
}
/**
 * revert the Experiment Value Migration
 */
async function down({ context: queryInterface }) {
  await queryInterface.dropTable("ExperimentAttributeValues")
}

export { up, down }
