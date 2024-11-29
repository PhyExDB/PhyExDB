import bcrypt from "bcrypt"
import { DataTypes, Model } from "sequelize"

class User extends Model {}

User.init(
  {
    // Model attributes are defined here
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
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
