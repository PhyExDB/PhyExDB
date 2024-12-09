import { DataTypes } from "sequelize"
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
      type: DataTypes.UUID,
      refereces: {
        model: "ExperimentAttributes",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
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
