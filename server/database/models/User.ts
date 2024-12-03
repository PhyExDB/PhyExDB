import bcrypt from "bcrypt"
import { DataTypes, Model } from "sequelize"
import type { UserList, UserDetail } from "~~/shared/types"
import sequelize from "~~/server/utils/sequelize"

/**
 * Represents a user in the system.
 *
 * @extends Model
 *
 * @property {string} id - The unique identifier for the user.
 * @property {string} username - The username of the user.
 * @property {string} role - The role of the user (e.g., admin, user).
 * @property {string} email - The email address of the user.
 * @property {string} verified - The verification status of the user.
 *
 * @method toUserList - Converts the current User instance to a UserList object.
 * @returns {UserList} An object containing the user's id, username, role, and verification status.
 *
 * @method toUserDetail - Converts the current User instance to a UserDetail object.
 * @returns {UserDetail} An object containing the user's id, username, role, verification status, and email.
 */
class User extends Model {
  declare id: string
  declare username: string
  declare role: string
  declare email: string
  declare verified: string

  /**
   * Converts the current User instance to a UserList object.
   *
   * @returns {UserList} An object containing the user's id, username, role, and verification status.
   */
  toUserList(): UserList {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      verified: this.verified,
    }
  }

  /**
   * Converts the User instance to a UserDetail object.
   *
   * @returns {UserDetail} An object containing the user's details including id, username, role, verified status, and email.
   */
  toUserDetail(): UserDetail {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      verified: this.verified,
      email: this.email,
    }
  }
}

User.init(
  {
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
      set(password: string) {
        const salt: string = bcrypt.genSaltSync()
        this.setDataValue("passwordHash", bcrypt.hashSync(password, salt))
      },
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "User", // model name
  },
)

export default User
