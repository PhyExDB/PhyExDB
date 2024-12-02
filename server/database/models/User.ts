import bcrypt from "bcrypt"
import { DataTypes, Model } from "sequelize"
import type { UserList, UserDetail } from "~~/shared/types"

class User extends Model {
  declare id: string
  declare username: string
  declare role: string
  declare email: string
  declare verified: string

  toUserList(): UserList {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      verified: this.verified,
    }
  }

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
