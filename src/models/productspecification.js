'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductSpecifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductSpecifications.belongsTo(models.Products, {
        foreignKey: 'id_product',
        targetKey: 'id',
        as: 'product',
      });
    }
  }

  ProductSpecifications.init(
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      id_product: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
      modelName: 'ProductSpecifications',
      tableName: 'product_specification',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ProductSpecifications;
};