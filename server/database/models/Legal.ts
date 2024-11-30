import { DataTypes, Model } from "sequelize"
import type { LegalDetail, LegalList } from "~~/shared/types"
import sequelize from "~~/server/utils/sequelize"

class Legal extends Model {
  declare id: string
  declare name: string
  declare slug: string
  declare content: string

  /**
   * Converts the current instance to a LegalList object.
   *
   * @returns {LegalList} An object containing the id, name, and slug of the current instance.
   */
  toLegalList(): LegalList {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
    }
  }

  /**
   * Converts the current instance to a LegalDetail object.
   *
   * @returns {LegalDetail} An object containing the id, name, slug, and content of the current instance.
   */
  toLegalDetail(): LegalDetail {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      content: this.content,
    }
  }
}

Legal.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Legal",
    tableName: "Legal",
  },
)

export default Legal
