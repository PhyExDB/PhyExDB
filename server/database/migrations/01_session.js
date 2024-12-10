import { DataTypes } from "sequelize"

/**
 * Run the User migrations.
 */
async function up({ context: queryInterface }) {
  await queryInterface.createTable("Sessions", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // subject
    UserId: {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
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
  await queryInterface.dropTable("Sessions")
}

export { up, down }