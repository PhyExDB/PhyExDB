import { DataTypes, Model } from "sequelize"
import User from "./User"

class Session extends Model {
  declare id: string
  declare sub: string
  // declare exp: Date
}

Session.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // subject
    sub: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    // expiration time
    exp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "Session", // model name
  },
)

export default Session
