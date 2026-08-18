'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Category.belongsToMany(models.Product, {
          through: 'product_categorie',
          foreignKey: 'id_categorie',
          otherKey: 'id_product',
          as: 'products',
        });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      url_img: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Category;
};