'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Products.belongsTo(models.Merks, {
        foreignKey: 'id_merk',
        targetKey: 'id',
        as: 'merk',
      });
      Products.hasMany(models.ProductSpecifications, {
        foreignKey: 'id_product',
        sourceKey: 'id',
        as: 'specifications',
        onDelete: "CASCADE"
      });
      Products.belongsToMany(models.Categories, {
        through: 'product_categorie',
        foreignKey: 'id_product',
        otherKey: 'id_categorie',
        as: 'categories',
      });
      Products.hasMany(models.ImgProducts, {
        foreignKey: 'id_product',
        sourceKey: 'id',
        as: 'images',
        onDelete: 'CASCADE',
      });
    }
  }

  Products.init(
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      id_merk: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },

      description: {
        type: DataTypes.TEXT,
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
      modelName: 'Products',
      tableName: 'products',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Products;
};