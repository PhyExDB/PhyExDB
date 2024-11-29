import bcrypt from "bcrypt"
import { DataTypes } from "sequelize"

/**
 * Run the User migrations.
 */
async function up({ context: queryInterface }) {
  await queryInterface.createTable("User", {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["User", "Moderator", "Administrator"],
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      set(password) {
        const salt = bcrypt.genSaltSync()
        this.setDataValue("passwordHash", bcrypt.hashSync(password, salt))
      },
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
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
  await queryInterface.dropTable("User")
}

export { up, down }
