import { DataTypes, Model } from "sequelize"
import sequelize from "../utils/sequelize"

class Role extends Model {}

Role.init(
  {
    // Model attributes are defined here
    name: {
      type: DataTypes.ENUM,
      values: ["User", "Moderator", "Administrator"],
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "Role", // model name
  },
)

export default Role
