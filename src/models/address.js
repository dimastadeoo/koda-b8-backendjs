'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Addresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Addresses.belongsTo(models.Profiles, {
        foreignKey: 'id',
        as: 'profile',
      });
    }
  }
   Addresses.init(
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      id_profile: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      label: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      receiver_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      detail_address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      province: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      district: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      village: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'Addresses',
      tableName: 'address',

      // Karena nama kolom timestamp kita custom
      // dan sudah ditulis eksplisit di attributes.
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Addresses;
};