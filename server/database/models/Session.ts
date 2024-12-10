import { DataTypes, Model } from "sequelize"
import User from "./User"
import type SessionToken from "./SessionToken"

class Session extends Model {
  declare id: string
  declare sub: User
  declare exp: Date
  declare UserId: string
  declare SessionTokens: SessionToken[]
}

Session.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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

User.hasMany(Session)
Session.belongsTo(User)

export default Session
