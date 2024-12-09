import { DataTypes } from "sequelize"

/**
 * Run the User migrations.
 */
async function up({ context: queryInterface }) {
  await queryInterface.createTable("SessionTokens", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    SessionId: {
      type: DataTypes.UUID,
      references: {
        model: "Sessions",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },
    valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // expiration time
    exp: {
      type: DataTypes.DATE,
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
 * Revert the User migrations.
 */
async function down({ context: queryInterface }) {
  await queryInterface.dropTable("SessionTokens")
}

export { up, down }
