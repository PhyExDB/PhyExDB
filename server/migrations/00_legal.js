import { DataTypes } from "sequelize"

async function up({ context: queryInterface }) {
  await queryInterface.createTable("legal", {
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
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  })
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable("legal")
}

export { up, down }
