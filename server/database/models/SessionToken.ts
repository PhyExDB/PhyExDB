import { DataTypes, Model } from "sequelize"
import Session from "./Session"

class SessionToken extends Model {
  declare id: string
  declare session: string
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
    session: {
      type: DataTypes.UUID,
      references: {
        model: Session,
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
    modelName: "SessionToken", // model name
  },
)

export default Session
