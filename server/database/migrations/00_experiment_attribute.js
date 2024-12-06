import { DataTypes } from "sequelize"
/**
 * run the Attribute
 */
async function up({ context: queryInterface }) {
  await queryInterface.createTable("ExperimentAttributes", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
 * revert the Experiment Attribute Migration
 */
async function down({ context: queryInterface }) {
  await queryInterface.dropTable("ExperimentAttributes")
}

export { up, down }
