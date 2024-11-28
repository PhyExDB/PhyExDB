import { DataTypes, Model } from "sequelize"

class File extends Model {}

File.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    /**
     * The path of the file relative to the public directory.
     * The path should not start with a slash and contain the id as the filename.
     */
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * The MIME type of the file.
     */
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * The description of the file.
     */
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "File",
  },
)

export default File
