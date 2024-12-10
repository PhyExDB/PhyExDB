import { DataTypes, Model } from "sequelize"
import Session from "./Session"

class SessionToken extends Model {
  declare id: string
  declare Session: Session
  declare SessionId: string
  declare valid: boolean
  declare exp: Date
}

SessionToken.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
  },
  {
    // Other model options go here
    sequelize, // connection instance
    modelName: "SessionToken", // model name
  },
)

Session.hasMany(SessionToken)
SessionToken.belongsTo(Session)

export default SessionToken
